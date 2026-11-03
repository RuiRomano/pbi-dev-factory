import salesQuery from "./sales/overview.dax?raw";
import hrQuery from "./hr/overview.dax?raw";

export const domains = [
    { name: "Sales", connection: "salesModel", query: salesQuery },
    { name: "HR", connection: "hrModel", query: hrQuery },
] as const;

export const kpis = [
    { id: "sales-amount", domain: "Sales", label: "Sales amount", format: "$ #,##0", description: "Quantity times net price in the latest available sales month." },
    { id: "sales-margin", domain: "Sales", label: "Margin", format: "$ #,##0", description: "Sales less unit cost in the latest available sales month." },
    { id: "sales-quantity", domain: "Sales", label: "Sales quantity", format: "#,##0", description: "Units sold in the latest available sales month." },
    { id: "sales-customers", domain: "Sales", label: "Customers", format: "#,##0", description: "Distinct customers with sales in the latest available sales month." },
    { id: "hr-headcount", domain: "HR", label: "Headcount", format: "#,##0", description: "Employed people at the latest available month-end snapshot." },
    { id: "hr-fte", domain: "HR", label: "Full-time equivalents", format: "#,##0.0", description: "Full-time equivalents at the latest available month-end snapshot." },
    { id: "hr-attrition", domain: "HR", label: "Attrition rate", format: "0.0%", description: "Exits divided by average monthly headcount over the trailing 12 complete months." },
    { id: "hr-salary", domain: "HR", label: "Monthly salary cost", format: "#,##0.00", description: "Illustrative monthly base-salary cost at the latest snapshot. Synthetic currency units, not payroll." },
] as const;

export type Kpi = typeof kpis[number];
