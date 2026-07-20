"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{
        borderRadius: 8,
        border: "1px solid #2563eb",
        background: "#2563eb",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        padding: "8px 14px",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Print / Save as PDF
    </button>
  );
}
