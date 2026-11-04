import type { QueryTable } from "@microsoft/rayfin-connector-fabric-semanticmodel";
import type { Kpi } from "@/queries";

export function readOverview(table: QueryTable) {
    if (table.rows.length === 0) return null;
    const row = Object.fromEntries(table.columns.map((column, i) => [column.name, table.rows[0][i]]));
    const start = row["[periodStart]"];
    const end = row["[periodEnd]"];
    if (typeof start !== "string" || typeof end !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return null;
    return { row, start, end };
}

export function formatKpi(value: unknown, format: Kpi["format"]) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "Not available";
    const decimals = format === "#,##0.00" ? 2 : format === "#,##0.0" || format === "0.0%" ? 1 : 0;
    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        style: format === "0.0%" ? "percent" : "decimal",
    }).format(value);
    return format.startsWith("$") ? `$ ${formatted}` : formatted;
}

export function formatPeriod(start: string, end: string) {
    const format = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    return `${format(start)} to ${format(end)}`;
}
