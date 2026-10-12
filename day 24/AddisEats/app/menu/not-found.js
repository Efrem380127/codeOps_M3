import Link from "next/link";

import Icon from "@/app/components/Icon";
import { dishes } from "@/app/data/dishes";

/**
 * Not-found state for /menu.
 *
 * A dead end is a design failure, so this one offers the three dishes most
 * likely to have been meant, rather than only an apology. The suggestions come
 * from the menu itself, so they cannot go stale.
 */
export default function NotFound() {
  return (
    <div className="state">
      <span className="state__icon" aria-hidden="true">
        <Icon name="info" />
      </span>

      <h1>No such dish</h1>

      <p className="mb-0">
        That dish is not on the menu. It may have been removed, or the link may
        have a typo in it.
      </p>

      <p className="small muted mb-0">
        Popular choices:{" "}
        {dishes.slice(0, 3).map((dish, index) => (
          <span key={dish.id}>
            {index > 0 && " · "}
            <Link href={`/menu/${dish.id}`}>{dish.name}</Link>
          </span>
        ))}
      </p>

      <Link className="btn btn-secondary" href="/menu">
        See the whole menu
      </Link>
    </div>
  );
}
