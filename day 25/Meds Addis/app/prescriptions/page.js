import Link from "next/link";
import { redirect } from "next/navigation";

import EmptyState from "@/app/components/EmptyState";
import PrescriptionForm from "./PrescriptionForm";
import { getSession } from "@/lib/session";
import { getPrescriptionsForUser } from "@/lib/prescriptions";
import { medicines } from "@/app/data/medicines";
import { dateOnly, timeAgo } from "@/lib/format";

export const metadata = {
  title: "Prescriptions",
  description:
    "Upload a prescription and track its pharmacist review. An approved prescription covers every order it names.",
  robots: { index: false, follow: false },
};

/**
 * Prescriptions.
 *
 * Rendering strategy: DYNAMIC — it reads cookies() and shows one account's
 * records, so there is nothing to prerender.
 *
 * The list is the patient's view of a queue they cannot see the other side of,
 * which is why the review outcome is spelled out in full: an approved
 * prescription, a rejected one with the pharmacist's reason, and a pending one
 * with what happens next. "Rejected" with no explanation is the single most
 * common way a review workflow fails its users.
 */
export default async function PrescriptionsPage() {
  // This route must be dynamic: reading cookies() below makes the response
  // depend on who is asking, so it cannot be prerendered at build time.
  const user = await getSession();

  if (!user) {
    redirect("/sign-in?next=/prescriptions");
  }

  const [prescriptions, prescriptionMedicines] = [
    await getPrescriptionsForUser(user.id),
    // Only prescription-only lines can be named on a prescription. Offering the
    // whole catalogue would let someone "authorise" paracetamol.
    medicines
      .filter((medicine) => medicine.requiresPrescription)
      .map((medicine) => ({
        id: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
        form: medicine.form,
      })),
  ];

  return (
    <main id="main" className="page container">
      <div className="section-head">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Prescriptions</h1>
          <p className="lede mt-2">
            A prescription is reviewed by a registered pharmacist. Once
            approved, it covers every order that names the medicines on it — you
            do not need to upload it again.
          </p>
        </div>
      </div>

      <div className="detail">
        <section aria-label="Your prescriptions">
          <h2 className="mb-4">
            Your prescriptions
            {prescriptions.length > 0 && (
              <span className="muted small"> · {prescriptions.length}</span>
            )}
          </h2>

          {prescriptions.length === 0 ? (
            <EmptyState
              icon="file"
              title="No prescriptions on file"
              actionHref="/medicines"
              actionLabel="Browse medicines"
            >
              If you order a medicine marked Rx, you will need one of these
              first. Upload it with the form beside this panel.
            </EmptyState>
          ) : (
            <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
              {prescriptions.map((rx) => (
                <li key={rx.id} className="card">
                  <div className="between">
                    <div>
                      <h3 className="card__title mb-0">{rx.id}</h3>
                      <p className="small muted mb-0">
                        {rx.prescriberName} · {rx.facility} · issued{" "}
                        {dateOnly.format(new Date(rx.issuedAt))}
                      </p>
                    </div>

                    <span className={`badge ${rx.statusBadge}`}>
                      {rx.statusLabel}
                    </span>
                  </div>

                  <ul className="spec-list mt-4">
                    <li>
                      <span className="spec-list__k">Patient</span>
                      <span>{rx.patientName}</span>
                    </li>
                    <li>
                      <span className="spec-list__k">Prescriber licence</span>
                      <span>{rx.prescriberLicence}</span>
                    </li>
                    <li>
                      <span className="spec-list__k">Covers</span>
                      <span>
                        {rx.medicines.length > 0
                          ? rx.medicines
                              .map((m) => `${m.name} ${m.strength}`)
                              .join(", ")
                          : "—"}
                      </span>
                    </li>
                    <li>
                      <span className="spec-list__k">Attachment</span>
                      <span>{rx.fileName}</span>
                    </li>
                    <li>
                      <span className="spec-list__k">Uploaded</span>
                      <span>{timeAgo(rx.uploadedAt)}</span>
                    </li>
                  </ul>

                  {rx.status === "approved" && (
                    <div className="alert alert--ok mt-4">
                      <div>
                        <p className="alert__title">Approved</p>
                        <p className="mb-0">
                          Reviewed by {rx.reviewerName ?? "a pharmacist"}
                          {rx.reviewedAt
                            ? ` on ${dateOnly.format(new Date(rx.reviewedAt))}`
                            : ""}
                          . You can attach this to an order at checkout.
                        </p>
                      </div>
                    </div>
                  )}

                  {rx.status === "rejected" && (
                    <div className="alert alert--error mt-4" role="status">
                      <div>
                        <p className="alert__title">
                          Not accepted — please re-upload
                        </p>
                        <p className="mb-0">{rx.reviewNote}</p>
                      </div>
                    </div>
                  )}

                  {rx.status === "pending" && (
                    <div className="alert alert--warn mt-4">
                      <div>
                        <p className="alert__title">With a pharmacist</p>
                        <p className="mb-0">
                          Reviews usually complete within the hour during
                          opening times. You will see the outcome here.
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="stack" aria-label="Upload a prescription">
          <PrescriptionForm medicines={prescriptionMedicines} />

          <section className="card">
            <h2 className="card__title">What a pharmacist checks</h2>
            <ul className="mt-2" style={{ fontSize: "var(--t-sm)" }}>
              <li>The prescriber&rsquo;s licence number against the register</li>
              <li>That the medicine, strength and quantity match</li>
              <li>That the prescription is still within its validity window</li>
              <li>That it names a medicine we actually stock</li>
            </ul>
            <p className="small muted mb-0">
              A rejection always carries a reason, so you know what to fix
              before re-uploading.
            </p>
          </section>
        </aside>
      </div>

      <p className="small muted mt-6">
        Looking for an order that is waiting on one of these?{" "}
        <Link href="/orders">Open your orders</Link>.
      </p>
    </main>
  );
}
