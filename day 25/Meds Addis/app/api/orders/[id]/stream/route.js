import { getSession } from "@/lib/session";
import { isStaff } from "@/app/data/users";
import { readOrder, ORDER_STATUS } from "@/lib/orders";

/**
 * GET /api/orders/:id/stream — Server-Sent Events.
 *
 * Why SSE rather than WebSockets: the data flows one way (courier position to
 * browser) and the connection is short-lived, so a standing two-way socket
 * would add operational cost on serverless infrastructure for no benefit. SSE
 * is plain HTTP, reconnects automatically in the browser, and needs no extra
 * library on either side.
 *
 * The protocol is unforgiving in three places, all of them handled below:
 *
 *   1. Every message ends with a BLANK LINE (`\n\n`). Without it the browser
 *      buffers the event and nothing ever arrives.
 *   2. `Content-Type` must be `text/event-stream`.
 *   3. The response must not be buffered by a proxy — hence `no-transform` and
 *      `x-accel-buffering: no`, or nginx and friends hold the stream until it
 *      closes, which defeats the point.
 *
 * The stream closes itself after MAX_TICKS. An SSE connection that runs forever
 * on a serverless platform is a billed connection that runs forever.
 */

export const dynamic = "force-dynamic";

const TICK_MS = 4000;
const MAX_TICKS = 45;

export async function GET(request, { params }) {
  const user = await getSession();

  if (!user) {
    return Response.json({ error: "Sign in to follow this order." }, { status: 401 });
  }

  const { id } = await params;
  const order = readOrder(id);

  if (!order) {
    return Response.json({ error: "Order not found", id }, { status: 404 });
  }

  // Same rule as the polling endpoint: an id is not a capability.
  if (order.userId !== user.id && !isStaff(user)) {
    return Response.json(
      { error: "You do not have access to this order." },
      { status: 403 },
    );
  }

  const encoder = new TextEncoder();
  let timer = null;
  let ticks = 0;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event, payload) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
        );
      };

      const snapshot = () => {
        const current = readOrder(id);

        return {
          orderId: current.id,
          status: current.status,
          statusLabel: current.statusLabel,
          itemCount: current.itemCount,
          total: current.total,
          courier: current.courier ?? null,
          serverTime: new Date().toISOString(),
        };
      };

      // Send the current state immediately, so the client does not wait a full
      // tick to render something.
      send("snapshot", snapshot());

      timer = setInterval(() => {
        ticks += 1;

        if (ticks > MAX_TICKS) {
          send("done", { reason: "stream-window-elapsed" });
          clearInterval(timer);
          controller.close();
          return;
        }

        // Nudge the courier toward the delivery address so the map visibly
        // moves. In Module 4 this is replaced by the driver app's real GPS
        // pings; the wire format does not change.
        const current = readOrder(id);
        if (current?.courier && current.status === ORDER_STATUS.OUT_FOR_DELIVERY) {
          const targetLat = 9.0125;
          const targetLng = 38.775;

          current.courier.lat += (targetLat - current.courier.lat) * 0.18;
          current.courier.lng += (targetLng - current.courier.lng) * 0.18;
          current.courier.updatedAt = new Date().toISOString();
        }

        send("snapshot", snapshot());
      }, TICK_MS);

      // The browser closing the tab fires abort; stop the timer with it or the
      // interval outlives the request.
      request.signal.addEventListener("abort", () => {
        if (timer) clearInterval(timer);
        try {
          controller.close();
        } catch {
          // Already closed — nothing to do.
        }
      });
    },

    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
