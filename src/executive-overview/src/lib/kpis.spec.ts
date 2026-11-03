import { describe, expect, it } from "vitest";
import { formatKpi, formatPeriod, readOverview } from "./kpis";

describe("executive metrics", () => {
    it("matches the existing model formats without treating blanks as zero", () => {
        expect(formatKpi(53517.038, "$ #,##0")).toBe("$ 53,517");
        expect(formatKpi(868.8, "#,##0.0")).toBe("868.8");
        expect(formatKpi(0.050174216027874564, "0.0%")).toBe("5.0%");
        expect(formatKpi(5939835.8333, "#,##0.00")).toBe("5,939,835.83");
        expect(formatKpi(0, "#,##0")).toBe("0");
        expect(formatKpi(null, "#,##0")).toBe("Not available");
        expect(formatKpi(NaN, "#,##0")).toBe("Not available");
    });

    it("reads exact query column aliases independently of column order", () => {
        const table = { columns: ["[sales-amount]", "[periodEnd]", "[periodStart]"].map(name => ({ name, dataType: "unknown" })), rows: [[53517.038, "2020-02-29", "2020-02-01"]] };
        expect(readOverview(table)).toMatchObject({ start: "2020-02-01", end: "2020-02-29", row: { "[sales-amount]": 53517.038 } });
        expect(formatPeriod("2020-02-01", "2020-02-29")).toBe("1 Feb 2020 to 29 Feb 2020");
    });

    it("has an empty state for missing data or period", () => {
        expect(readOverview({ columns: [], rows: [] })).toBeNull();
        expect(readOverview({ columns: [], rows: [[]] })).toBeNull();
    });
});
