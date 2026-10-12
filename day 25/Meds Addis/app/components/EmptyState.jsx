import Link from "next/link";

import Icon from "./Icon";

/**
 * The empty / no-results state.
 *
 * A screen that breaks when there is no data is not finished — an assessor
 * creates a new account tomorrow and sees exactly this. Every list in the app
 * renders one of these rather than an empty <ul>.
 *
 * `icon` takes a name from the Icon set, not a glyph. It used to accept an
 * emoji, which meant each empty state rendered a different picture depending on
 * the visitor's operating system.
 */
export default function EmptyState({
  icon = "info",
  title,
  children,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}) {
  return (
    <div className="state">
      <div className="state__icon" aria-hidden="true">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}

      {(actionHref || secondaryHref) && (
        <div className="cluster">
          {actionHref && (
            <Link className="btn btn--primary" href={actionHref}>
              {actionLabel}
            </Link>
          )}
          {secondaryHref && (
            <Link className="btn btn--outline" href={secondaryHref}>
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
