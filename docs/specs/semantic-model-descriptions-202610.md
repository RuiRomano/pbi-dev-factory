# Align sales model descriptions with company context

## Goal
Give self-service users clear descriptions of the sales model's visible objects, using [Northwind Retail Group terminology](../../assets/company-context.md). Describe what the model actually computes and flag company-rule mismatches rather than hiding them.

## Scope
- Change: descriptions for five tables, 13 measures, 53 visible columns, and the Calendar hierarchy and its three levels in [sales.SemanticModel](../../src/sales.SemanticModel/definition).
- Keep unchanged: hidden fields, object names, DAX, Power Query, formats, visibility, relationships, security, source data, translations, reports and deployments. Calculation fixes require a separate request.

## Approach
Confirmed: the local TMDL model loads through `powerbi-authoring-local` in offline mode. None of the scoped objects has a description. Add business-friendly descriptions in the five table files below. Explain table purpose and intended grain, column meaning and units, and each measure's calculation and limits. Keep technical codes distinct from user-facing labels.

| File and objects | Proposed description content |
| --- | --- |
| [Sales](../../src/sales.SemanticModel/definition/tables/Sales.tmdl): `Sales Amount`, `Cost`, `Margin` | Sales amount sums quantity multiplied by net unit price; cost sums quantity multiplied by unit cost; margin is their difference, not a percentage or net profit. Do not equate sales amount with NRG revenue until returns, discounts and currency treatment are confirmed. The calculations do not use `Exchange Rate`; currency symbols do not establish the reporting currency. |
| Sales: `Sales Qty`, `# Sales`, `# Customers (w/ Sales)` | Respectively: individual product units, sales-table rows rather than distinct orders or baskets, and distinct customer keys in filtered sales. Do not describe the last measure as loyalty members or active customers. |
| Sales: `Sales Amount (LY)`, `Sales Amount Avg per Day`, `Sales Amount (6M average)`, `Sales Amount (12M average)` | Explain prior-year comparison and its positive-current-sales condition. Daily averages omit blank-result dates. Rolling measures average daily sales over the trailing window ending at the latest selected date, not monthly totals, and retain their existing sales-date guard. |
| [Calendar](../../src/sales.SemanticModel/definition/tables/Calendar.tmdl): `Fiscal Year`, `Fiscal Quarter`, `Year-Month-Day` | Distinguish calendar dates and hierarchy levels from fiscal periods. Flag that `Fiscal Year` currently uses a July boundary and the fiscal-quarter expression does not implement NRG's February-January calendar. Do not claim FY24-style labels already exist. |
| [Store](../../src/sales.SemanticModel/definition/tables/Store.tmdl): `Square Meters`, `Country`, `# Stores` | Describe store area in square meters, store geography, and the count of store records in filter context, not necessarily currently open stores. Area supports footprint analysis; there is no existing Sales per Square Meter measure to document. |
| [Customer](../../src/sales.SemanticModel/definition/tables/Customer.tmdl): `Country`, `Country Code`, `Age`, `# Customers` | Separate customer geography from store geography and country names from codes. Age is a refresh-time year-boundary calculation, not exact completed years. Customer count counts dimension rows, unlike customers with sales. Do not imply loyalty tiers, channel preference or lifecycle segments exist. |
| [Product](../../src/sales.SemanticModel/definition/tables/Product.tmdl): `Brand`, `Manufacturer`, `Weight`, `Weight Unit Measure`, `# Products` | Distinguish brand from manufacturer, pair weight with its unit field, and describe product-record count. Do not assert the four company brands are the actual loaded values without evidence. |

Use the company context for vocabulary, not as evidence of data coverage. Sales Power Query can randomize quantities and net prices; descriptions must not present these as certified company revenue. No new data source is needed.

## Acceptance checks
- Every scoped object has a nonempty description: five tables, 13 measures, 53 columns, one hierarchy and three levels. Hidden fields remain untouched.
- Descriptions distinguish units, rows, orders, customers, daily averages and monetary amounts. They do not claim unsupported net revenue, currency conversion, fiscal compliance, loyalty, channel coverage or country-level access restrictions.
- Reload the saved TMDL successfully and compare metadata before and after: only scoped descriptions differ. All expressions, identifiers and report bindings remain unchanged. No refresh or deployment is required.

## Open questions
- Returns and discount handling, monetary currency basis, exchange-rate direction, source-value coverage and actual row uniqueness were not verified offline. Use explicit caveats until the data owner confirms them; do not invent definitions.
- The fiscal mismatch and absent local RLS roles are observations, not fixes in this scope. Deployed permissions and country access were not inspected.
