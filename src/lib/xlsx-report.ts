import * as XLSX from "xlsx";

export function buildWorkbookBuffer(sheets: Array<{ name: string; rows: Record<string, unknown>[] }>): Uint8Array<ArrayBuffer> {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet.rows), sheet.name);
  }
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  // `Uint8Array.from` always allocates a fresh, plain ArrayBuffer-backed
  // array — unlike `new Uint8Array(buffer)`, which inherits Buffer's wider
  // `ArrayBufferLike` (it may be backed by a SharedArrayBuffer) and then
  // fails BodyInit's stricter `ArrayBuffer`-only typing below.
  return Uint8Array.from(buffer);
}

export function xlsxResponse(buffer: Uint8Array<ArrayBuffer>, filename: string): Response {
  return new Response(new Blob([buffer]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
