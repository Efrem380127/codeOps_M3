"use client";

import { useState } from "react";

import { toCsv, downloadCsv, csvFilename } from "@/lib/csv";

/**
 * CSV export.
 *
 * The serialiser lives in lib/csv.js and implements RFC 4180 — quoting any
 * field containing a comma, a quote or a newline, and doubling embedded quotes.
 * That is not theoretical here: delivery addresses and order notes contain
 * commas, and without the quoting rule the exported file is silently misaligned
 * by one column from the first such row onward.
 *
 * A UTF-8 BOM is prepended by downloadCsv(), because Excel on Windows otherwise
 * reads the file as Latin-1 and turns Amharic place names into mojibake.
 *
 * The button is disabled while the download is being prepared, which is the
 * same double-submit guard the forms use.
 */
export default function DownloadCsvButton({ orders = [], stock = [] }) {
  const [busy, setBusy] = useState(null);

  function exportOrders() {
    setBusy("orders");

    try {
      const rows = orders.map((order) => ({
        Order: order.id,
        Placed: order.placedAt,
        Customer: order.contactName ?? "",
        Phone: order.contactPhone ?? "",
        Address: order.deliveryAddress ?? "",
        Status: order.statusLabel,
        Items: order.itemCount,
        Subtotal: order.subtotal,
        Delivery: order.deliveryFee,
        Total: order.total,
        Prescription: order.prescriptionId ?? "",
        Note: order.note ?? "",
      }));

      downloadCsv(
        csvFilename("orders"),
        toCsv(rows, [
          "Order",
          "Placed",
          "Customer",
          "Phone",
          "Address",
          "Status",
          "Items",
          "Subtotal",
          "Delivery",
          "Total",
          "Prescription",
          "Note",
        ]),
      );
    } finally {
      setBusy(null);
    }
  }

  function exportStock() {
    setBusy("stock");

    try {
      const rows = stock.map((medicine) => ({
        Id: medicine.id,
        Name: medicine.name,
        Generic: medicine.genericName,
        Strength: medicine.strength,
        Form: medicine.form,
        Category: medicine.category,
        Pack: medicine.packSize,
        Price: medicine.price,
        Stock: medicine.stock,
        PrescriptionOnly: medicine.requiresPrescription ? "yes" : "no",
        Manufacturer: medicine.manufacturer,
      }));

      downloadCsv(
        csvFilename("stock"),
        toCsv(rows, [
          "Id",
          "Name",
          "Generic",
          "Strength",
          "Form",
          "Category",
          "Pack",
          "Price",
          "Stock",
          "PrescriptionOnly",
          "Manufacturer",
        ]),
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="cluster">
      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={exportOrders}
        disabled={busy !== null || orders.length === 0}
      >
        {busy === "orders" ? "Preparing…" : "Export orders CSV"}
      </button>

      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={exportStock}
        disabled={busy !== null || stock.length === 0}
      >
        {busy === "stock" ? "Preparing…" : "Export stock CSV"}
      </button>
    </div>
  );
}
