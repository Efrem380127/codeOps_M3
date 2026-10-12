"use client";

import { useActionState, useState } from "react";

import { reviewPrescription } from "@/app/actions/prescription";
import Icon from "@/app/components/Icon";
import { timeAgo } from "@/lib/format";

/**
 * One prescription in the pharmacist's queue.
 *
 * Both decisions go through the same server action, which re-checks the
 * pharmacist role before writing anything. This component decides what to
 * render; it does not decide what is allowed.
 *
 * The reject path requires a reason of at least ten characters, and that rule
 * lives in lib/schema.js — not here — so the same constraint applies whether the
 * form is used or the action is called from the console.
 */
function ReviewCard({ prescription }) {
  const [state, formAction, isPending] = useActionState(reviewPrescription, null);
  const [decision, setDecision] = useState("approve");

  if (state?.ok) {
    return (
      <li className="card">
        <div className="alert alert--ok" role="status">
          <div>
            <p className="alert__title">Decision recorded</p>
            <p className="mb-0">{state.message}</p>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="card">
      <div className="between">
        <div>
          <h3 className="card__title mb-0">{prescription.id}</h3>
          <p className="small muted mb-0">
            {prescription.patientName} · uploaded {timeAgo(prescription.uploadedAt)}
          </p>
        </div>
        <span className={`badge ${prescription.statusBadge}`}>
          {prescription.statusLabel}
        </span>
      </div>

      <ul className="spec-list mt-4">
        <li>
          <span className="spec-list__k">Prescriber</span>
          <span>{prescription.prescriberName}</span>
        </li>
        <li>
          <span className="spec-list__k">Licence</span>
          <span>
            <code>{prescription.prescriberLicence}</code>
          </span>
        </li>
        <li>
          <span className="spec-list__k">Facility</span>
          <span>{prescription.facility}</span>
        </li>
        <li>
          <span className="spec-list__k">Attachment</span>
          <span>{prescription.fileName}</span>
        </li>
        <li>
          <span className="spec-list__k">Covers</span>
          <span>
            {prescription.medicines.map((m) => `${m.name} ${m.strength}`).join(", ")}
          </span>
        </li>
        {prescription.notes && (
          <li>
            <span className="spec-list__k">Patient note</span>
            <span>{prescription.notes}</span>
          </li>
        )}
      </ul>

      {state?.error && (
        <div className="alert alert--error mt-4" role="alert">
          <div>
            <p className="alert__title">Not recorded</p>
            <p className="mb-0">{state.error}</p>
          </div>
        </div>
      )}

      <form className="form mt-4" action={formAction}>
        <input type="hidden" name="prescriptionId" value={prescription.id} />
        <input type="hidden" name="decision" value={decision} />

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field__label">Decision</legend>

          <div className="cluster">
            <label className="check">
              <input
                type="radio"
                name="decision-choice"
                value="approve"
                checked={decision === "approve"}
                onChange={() => setDecision("approve")}
              />
              <span>Approve</span>
            </label>

            <label className="check">
              <input
                type="radio"
                name="decision-choice"
                value="reject"
                checked={decision === "reject"}
                onChange={() => setDecision("reject")}
              />
              <span>Reject</span>
            </label>
          </div>
        </fieldset>

        <div className="field">
          <label className="field__label" htmlFor={`note-${prescription.id}`}>
            {decision === "reject" ? "Reason for rejection" : "Review note (optional)"}
          </label>
          <textarea
            id={`note-${prescription.id}`}
            name="note"
            className="textarea"
            required={decision === "reject"}
            placeholder={
              decision === "reject"
                ? "At least ten characters — this is what the patient is told."
                : "Checked against the EFDA register."
            }
            aria-invalid={state?.fieldErrors?.note ? "true" : undefined}
            aria-describedby={`note-hint-${prescription.id}`}
          />
          {state?.fieldErrors?.note ? (
            <p className="field__error">{state.fieldErrors.note}</p>
          ) : (
            <p className="field__hint" id={`note-hint-${prescription.id}`}>
              {decision === "reject"
                ? "A rejection without a reason is worse than no review at all."
                : "Recorded against your name in the audit trail."}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`btn ${decision === "reject" ? "btn--danger" : "btn--primary"}`}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending
            ? "Recording…"
            : decision === "reject"
              ? "Reject prescription"
              : "Approve prescription"}
        </button>
      </form>
    </li>
  );
}

/**
 * The review queue.
 *
 * Oldest first, because a queue is worked from the front. The empty state is
 * not decoration here — "nothing waiting" is the normal, good state of a
 * pharmacy queue, and it should read that way rather than as a blank screen.
 */
export default function ReviewQueue({ prescriptions = [] }) {
  if (prescriptions.length === 0) {
    return (
      <div className="state">
        <div className="state__icon" aria-hidden="true">
          <Icon name="check" />
        </div>
        <h3>Nothing waiting for review</h3>
        <p>
          Every prescription has a decision. New uploads appear here oldest
          first.
        </p>
      </div>
    );
  }

  return (
    <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
      {prescriptions.map((prescription) => (
        <ReviewCard key={prescription.id} prescription={prescription} />
      ))}
    </ul>
  );
}
