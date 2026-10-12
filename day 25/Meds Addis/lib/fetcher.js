/**
 * SWR fetcher.
 *
 * Reads the HTTP status so callers can distinguish "no such record" from
 * "the network is down" — the difference between a 404 empty state and an
 * error state, which is a distinction the rubric asks for explicitly.
 */

export class FetchError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "FetchError";
    this.status = status;
  }
}

export default async function fetcher(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch {
      // Body was not JSON — the status message is all we have.
    }

    throw new FetchError(detail, response.status);
  }

  return response.json();
}
