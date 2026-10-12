import { ORDER_FLOW, ORDER_STATUS, ORDER_STATUS_LABEL } from "@/lib/orders";
import { when } from "@/lib/format";

/**
 * Order progress.
 *
 * Rendered as an ordered list, because the statuses genuinely are a sequence —
 * a screen reader announcing "step 3 of 5" is more useful than a row of divs.
 *
 * A cancelled order leaves the flow entirely, so it is handled as its own case
 * rather than being drawn as a sixth step. Showing a cancelled order sitting at
 * step 2 of 5 would imply it is still progressing.
 *
 * The `data-done` / `data-current` attributes drive the styling in globals.css,
 * which keeps the visual decision out of the markup.
 */
export default function OrderTimeline({ order }) {
  if (order.status === ORDER_STATUS.CANCELLED) {
    return (
      <ol className="timeline">
        <li data-done="true">
          <p className="timeline__label mb-0">Order placed</p>
          <p className="timeline__meta mb-0">
            {when.format(new Date(order.placedAt))}
          </p>
        </li>

        <li data-current="true">
          <p className="timeline__label mb-0">Cancelled</p>
          <p className="timeline__meta mb-0">
            {order.cancelledAt
              ? when.format(new Date(order.cancelledAt))
              : "This order was cancelled."}
          </p>
        </li>
      </ol>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(order.status);

  return (
    <ol className="timeline">
      {ORDER_FLOW.map((status, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;

        return (
          <li
            key={status}
            data-done={done ? "true" : "false"}
            data-current={current ? "true" : "false"}
          >
            <p className="timeline__label mb-0">
              {ORDER_STATUS_LABEL[status]}
              {current && (
                <span className="visually-hidden"> — current step</span>
              )}
            </p>
            <p className="timeline__meta mb-0">
              {current
                ? "In progress"
                : done
                  ? "Complete"
                  : "Not yet started"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
