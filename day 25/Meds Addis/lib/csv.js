/**
 * Meds Addis — CSV serialisation (RFC 4180).
 *
 * The three rules that matter, and the three people usually get wrong:
 *
 *  1. A field containing a comma, a quote or a newline must be wrapped in
 *     double quotes.
 *  2. A literal double quote inside a quoted field is escaped by doubling it.
 *  3. Rows are separated by CRLF, not LF — Excel on Windows depends on it.
 *
 * Order notes and delivery addresses routinely contain commas, so this is not
 * theoretical: without rule 1 the exported file is silently misaligned.
 */

/** Escape a single field. */
export function escapeCell(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Serialise an array of objects to CSV.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {string[]} [columns] Optional explicit column order. Defaults to the
 *   keys of the first row — pass this when the row shape can vary, otherwise a
 *   sparse first row silently drops columns.
 */
export function toCsv(rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) return "";

  const keys = columns ?? Object.keys(rows[0]);

  const header = keys.map(escapeCell).join(",");

  const body = rows
    .map((row) => keys.map((key) => escapeCell(row[key])).join(","))
    .join("\r\n");

  return `${header}\r\n${body}\r\n`;
}

/** Triggers a client-side download of a CSV string. Browser only. */
export function downloadCsv(filename, csv) {
  // The BOM makes Excel read the file as UTF-8, which matters because
  // medicine names and delivery addresses contain Amharic characters.
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/** "meds-addis-orders-2026-10-12.csv" */
export function csvFilename(prefix) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `meds-addis-${prefix}-${stamp}.csv`;
}
