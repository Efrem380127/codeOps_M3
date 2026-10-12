"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { uploadPrescription } from "@/app/actions/prescription";

/**
 * Prescription upload.
 *
 * A Server Action through `useActionState`, so the same three benefits as
 * checkout apply: it works before hydration, `isPending` disables the button
 * mid-flight, and validation errors come back per field.
 *
 * On the attachment — this build records the FILE NAME, not the file. Object
 * storage arrives in Module 4, and pretending otherwise would be the dishonest
 * option; the panel says so in plain language rather than implying a scan was
 * uploaded somewhere. The name is still required, because a prescription with
 * no attached document is not a prescription.
 *
 * The medicine checkboxes are how a prescription is tied to specific products.
 * `name="medicineIds"` repeated is what formData.getAll() reads on the server.
 */
export default function PrescriptionForm({ medicines = [] }) {
  const [state, formAction, isPending] = useActionState(uploadPrescription, null);

  const [fileName, setFileName] = useState("");
  const errors = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <section className="card">
        <h2 className="card__title">Prescription uploaded</h2>

        <div className="alert alert--ok mt-4" role="status">
          <div>
            <p className="alert__title">Reference {state.prescriptionId}</p>
            <p className="mb-0">{state.message}</p>
          </div>
        </div>

        <Link className="btn btn--primary btn--block mt-4" href="/medicines">
          Browse medicines
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="card__title">Upload a prescription</h2>
      <p className="small muted">
        Anything marked Rx in the catalogue needs one of these before it can be
        dispensed.
      </p>

      {state?.error && (
        <div className="alert alert--error mt-4" role="alert">
          <div>
            <p className="alert__title">We could not record that</p>
            <p className="mb-0">{state.error}</p>
          </div>
        </div>
      )}

      <form className="form mt-4" action={formAction}>
        <div className="field">
          <label className="field__label" htmlFor="patientName">
            Patient name
          </label>
          <input
            id="patientName"
            name="patientName"
            className="input"
            required
            aria-invalid={errors.patientName ? "true" : undefined}
          />
          {errors.patientName && (
            <p className="field__error">{errors.patientName}</p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="prescriberName">
            Prescriber name
          </label>
          <input
            id="prescriberName"
            name="prescriberName"
            className="input"
            placeholder="Dr. Tigist Wolde"
            required
            aria-invalid={errors.prescriberName ? "true" : undefined}
          />
          {errors.prescriberName && (
            <p className="field__error">{errors.prescriberName}</p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="prescriberLicence">
            Prescriber licence number
          </label>
          <input
            id="prescriberLicence"
            name="prescriberLicence"
            className="input"
            placeholder="EFDA-MD-2015-8823"
            required
            aria-invalid={errors.prescriberLicence ? "true" : undefined}
            aria-describedby="licence-hint"
          />
          {errors.prescriberLicence ? (
            <p className="field__error">{errors.prescriberLicence}</p>
          ) : (
            <p className="field__hint" id="licence-hint">
              Checked against the EFDA register by the reviewing pharmacist.
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="facility">
            Facility
          </label>
          <input
            id="facility"
            name="facility"
            className="input"
            placeholder="Black Lion Hospital"
            required
            aria-invalid={errors.facility ? "true" : undefined}
          />
          {errors.facility && <p className="field__error">{errors.facility}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="issuedAt">
            Date issued
          </label>
          <input
            id="issuedAt"
            name="issuedAt"
            className="input"
            type="date"
            required
            aria-invalid={errors.issuedAt ? "true" : undefined}
          />
          {errors.issuedAt && <p className="field__error">{errors.issuedAt}</p>}
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field__label">
            Medicines this prescription covers
          </legend>
          <p className="field__hint mb-2">
            A pharmacist checks that the order matches what is named here.
          </p>

          <div className="stack" style={{ gap: "var(--sp-2)" }}>
            {medicines.map((medicine) => (
              <label key={medicine.id} className="check">
                <input type="checkbox" name="medicineIds" value={medicine.id} />
                <span>
                  <strong>{medicine.name}</strong>{" "}
                  <span className="small muted">
                    {medicine.genericName} · {medicine.strength} ·{" "}
                    {medicine.form}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {errors.medicineIds && (
            <p className="field__error mt-2">{errors.medicineIds}</p>
          )}
        </fieldset>

        <div className="field">
          <label className="field__label" htmlFor="prescriptionFile">
            Attachment
          </label>
          <input
            id="prescriptionFile"
            className="input"
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? "")
            }
            aria-describedby="file-hint"
          />
          {/*
            The action reads `fileName`, not the file itself. Object storage is
            Module 4 — this keeps the record honest about what it holds.
          */}
          <input type="hidden" name="fileName" value={fileName} />
          {errors.fileName ? (
            <p className="field__error">{errors.fileName}</p>
          ) : (
            <p className="field__hint" id="file-hint">
              We record the document name in this build; the file itself is not
              stored yet. A pharmacist reviews the scan before dispensing.
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="notes">
            Notes for the pharmacist{" "}
            <span className="muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            className="textarea"
            placeholder="Dose, duration, or anything the pharmacist should know."
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Uploading…" : "Upload prescription"}
        </button>
      </form>
    </section>
  );
}
