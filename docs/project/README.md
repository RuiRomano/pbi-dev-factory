# Power BI Artifact Catalog

## Overview

This project presents Northwind Retail Group sales analysis using sample retail data and a separate, fictional HR demo semantic model and local report. The sales Import model connects sales lines to calendar, product, customer and store dimensions. The sales-overview report provides an interactive sales summary and a category-by-year financial matrix. The customer-comparison report compares new and existing customers by month. All three HR pages have Desktop screenshots; agreement with the latest saved definitions and interactive behavior remain unverified.

The source queries can randomize sales quantities and net prices at refresh. Treat the results as sample analysis, not certified company revenue. Currency conversion, returns and company fiscal-calendar compliance are not established by the definitions.

## Artifacts

| Artifact | Type | Source | Connected artifact(s) | Purpose | Documentation |
|---|---|---|---|---|---|
| sales | Semantic model | `src/sales.SemanticModel` | sales-overview and customer-comparison reports | Sales amounts, cost, margin, quantities, new and returning customers, and entity counts by date, product, customer and store. | [Open](sales.semantic-model.md) |
| hr | Semantic model | `src/hr.SemanticModel` | hr report | Synthetic employee snapshots and movements for headcount, FTE, salary cost and attrition demonstrations. | [Open](hr.semantic-model.md) |
| lakehouse-sample-model | Semantic model | `src/lakehouse-sample-model.SemanticModel` | No report | Delivered lakehouse sales, with separate purchasing/billing and invoice/delivery roles; Direct Lake on OneLake with SSO. Validation remains blocked. | [Details](#lakehouse-sample-model) |
| hr | Report | `src/hr.Report` | hr semantic model, bound by relative path | Three-page fictional HR demo: workforce trends, exits and workforce mix. Local only; current Desktop screenshots documented. | [Open](hr.report.md) |
| sales-overview | Report | `src/sales-overview.Report` | sales semantic model, bound by relative path | Sales overview, trends, product and store comparisons, and annual category KPIs. | [Open](sales-overview.report.md) |
| customer-comparison | Report | `src/customer-comparison.Report` | sales semantic model, bound by relative path | Monthly comparison and detail for new, existing and total customers with sales. | [Source](../../src/customer-comparison.Report/definition/pages/2b3f5f9676144f1e9f79/page.json) |

## Project Entry Point and Shared Resources

Open [sales-overview.pbip](../../src/sales-overview.pbip) in Power BI Desktop. Its report definition binds to `../sales.SemanticModel`; no published workspace binding is specified.

Open [customer-comparison.pbip](../../src/customer-comparison.pbip) for the separate, single-page customer report. It uses the same local model and the [Contoso theme](../../src/customer-comparison.Report/StaticResources/RegisteredResources/Contoso.json). The chart groups by `Calendar[Year-Month]`, sorted ascending, and compares `Sales[# New Customers]` with `Sales[# Returning Customers]`, displayed as existing customers. The matrix also shows `Sales[# Customers (w/ Sales)]`. Date, category and brand filters are available in the filter pane; there are no slicers.

Existing customers are customers with sales who are not new in the same period. The report inherits the model's filter-dependent classification, not an unconditional lifetime definition. A customer who makes first and later purchases in a period counts only as new. Totals recalculate in the selected period and are not sums of monthly counts. The existing report and semantic model are unchanged.

The report uses a registered [Contoso theme](../../src/sales-overview.Report/StaticResources/RegisteredResources/Contoso718570950292274.json) over the Fluent2 base theme. The model shares the `HttpSource`, `Environment` and `Randomizer` Power Query parameters across its queries.

The [description specification](../specs/semantic-model-descriptions-202610.md) provides supporting interpretation and caveats. Its linked company-context file is absent from the current worktree, so it was not treated as an available business glossary.

## Run deployed model tests

Install the project requirements and the Fabric CLI, then authenticate with `fab auth login --azure-cli` using an existing Azure CLI session. Set `WORKSPACE_NAME` in the root `.env` file and run:

```powershell
python scripts\test-data.py
```

The [test data script](../../scripts/test-data.py) finds semantic models under `src`, reads their display names from `.platform`, resolves their deployed IDs with `fab get`, and runs `EVALUATE Tests.Run()` through the Power BI API. It prints the query results as an aligned table and stops on a CLI or query error. After testing all models, it raises one error listing every test whose `[Passed]` value is not JSON `true`, including the model name and test details, and exits with a nonzero status.

The [test data workflow](../../.github/workflows/test-data.yml) runs manually from GitHub Actions or through the [PR validation workflow](../../.github/workflows/pr-validation.yml) against the DEV workspace. It uses the DEV environment's `AZURE_CREDENTIALS` secret to sign in to Azure, authenticates Fabric CLI with `fab auth login --azure-cli`, and runs the same script. A failed test fails the workflow.

PR validation runs for pull requests targeting `main` that change `src/**`, or manually. It calls BPA, then deploys and refreshes the DEV workspace only if BPA succeeds, then runs the data tests only if deployment and refresh succeed. Each called workflow also supports manual execution. Deployment and tests retain the DEV environment's secrets and approval rules. Matching PRs share the same DEV workspace; fork PRs cannot access deployment secrets.

## Refresh deployed models

With the same dependencies, Fabric CLI authentication and `WORKSPACE_NAME` configuration as the test script, run:

```powershell
python scripts\refresh.py
```

The [refresh script](../../scripts/refresh.py) discovers models under `src` using their `.platform` display names and requests a full refresh for each deployed model, one at a time. It polls the specific refresh every five seconds for up to 600 seconds per model. It prints success only when the refresh completes. A CLI error, API error, unsuccessful refresh or timeout raises an error and stops the script. Timing out does not cancel the refresh in the service.

## Inspection and Validation

Updated HR screenshot documentation on 2026-11-01. All three current Desktop pages were captured and reviewed, with populated charts and no visible visual error messages. The window was not reloaded from disk. See [HR screenshot inspection](hr.report.md#screenshot-inspection-2026-11-01) for capture scope and unverified behavior. Unrelated artifact documentation and screenshots were preserved; the existing customer-comparison document and screenshot coverage gap remains.

The customer-comparison report was added on 2026-10-31 following approval of a separate, one-page monthly comparison using returning customers as existing customers. Report-authoring CLI validation passed with zero errors and warnings. All 36 existing live `Tests.Run` assertions passed against the development sales model. A monthly query returned 34 months with sales, including 22 with existing customers, with zero reconciliation failures and zero negative counts. Local BPA could not run because its Tabular Editor executable requires Windows. Service preview failed with `RENDER_FAILED: CreateReportFailed`, code `401`, request ID `afb450aa-b832-4156-a1c8-02f141e026cb`. No screenshots were captured, so rendering, layout and interactive filtering remain unverified. The report has not been published.

Updated on 2026-10-30 for [returning customers](../specs/returning-customers-202610.md). Coverage includes one model and one report, with five tables, 63 columns, 15 measures, four relationships, one hierarchy, two report pages and nine visuals. Report documentation and screenshots were preserved because no report definitions changed.

Both page screenshots were captured and reviewed. They show the existing Desktop window without a reload from disk. Saved report metadata is authoritative for bindings and calculations; screenshots illustrate the current rendered experience. The KPI heading differs between the window and saved definition. See the [report limitations](sales-overview.report.md#inspection-and-screenshot-limitations).

The model was saved locally, deployed to the configured DEV workspace and refreshed. The deployment script also republished the unchanged report. All 36 `Tests.Run` assertions passed, including the original four; the reused customer measures matched their baseline. Independent first-sale calculations matched 2,815 grouped returning-customer results. Source-data uniqueness and deployed access controls were not tested.

Both artifacts have one document and both report pages retain their screenshots. Updated links were checked. The pre-existing description-spec link above points to a file absent from this worktree; it remains a documentation gap outside this change.

## lakehouse-sample-model

Implemented locally and deployed only to `RR - PBI Factory {dev}` on 2026-11-01 under the [approved spec](../specs/lakehouse-sample-direct-lake-202611.md), which remains **In progress**. Documentation is included here rather than creating another Markdown file. This is a separate sample model, not certified Northwind revenue; no report, source transformation, calculated column, RLS/OLS rule or permission change was introduced.

### Source and structure

The [model folder](../../src/lakehouse-sample-model.SemanticModel) uses compatibility 1702, discourages implicit measures and disables auto date/time. One shared `AzureStorage.DataLake` expression points to workspace `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38`, lakehouse `d3065cfd-ff4d-4bb0-aa89-d27d97c8e011`. All eight partitions are entity partitions in Direct Lake mode; `directLakeBehavior` is `directLakeOnly`. Source columns are explicitly mapped, keys and aggregation-only columns are hidden, and numeric slicing attributes do not summarize.

| Table | Source | Grain and relationship role | Independently counted source rows |
|---|---|---|---:|
| Sales | `fact_sale` | One delivered `SaleKey` record, without regrouping or deduplication | 20,000 |
| City | `dimension_city` | City key | 20,000 |
| Customer | `dimension_customer` | Purchasing customer | 403 |
| Bill To Customer | `dimension_customer` | Billing customer; label comes from the referenced row's `Customer`, not its `BillToCustomer` attribute | 403 |
| Product | `dimension_stock_item` | Stock-item key, named consistently with the existing sales model | 672 |
| Employee | `dimension_employee` | Salesperson | 213 |
| Calendar | `dimension_date` | Invoice date | 731 |
| Delivery Calendar | `dimension_date` | Delivery date, independently filterable alongside invoice date | 731 |

Seven active, single-direction many-to-one relationships connect Sales to these dimension keys. Both calendars are marked date tables. Month and short-month labels sort by calendar month number; fiscal month labels sort by delivered fiscal month number; year labels sort by their numeric year. Year-month source labels are omitted because no source chronological year-month sort key exists; no calculated sort keys were added. Technical identifiers, postal codes, barcodes, unit prices, tax rates and nonessential numeric attributes are omitted rather than given misleading aggregations or recovered leading zeros.

Source `SaleKey` is unique and nonblank. `WWIInvoiceID` has only two distinct values, so invoice-line grain is **not** asserted. Customer, employee and product unknown-member key `0` is retained. Fiscal attributes are delivered sample values, not the company's February–January calendar; the date range spans two full calendar years, not necessarily full fiscal years.

### Measures and independent references

Every measure lives in Sales, uses a simple stored-column sum or row count, has a description and format, and intentionally returns blank for an empty sales selection. Dollar display was approved, but no currency code is inferred. Money retains `double` precision without DAX rounding.

| Measure | Calculation | Independent SQL total |
|---|---|---:|
| SALES QUANTITY | Sum `Quantity` in delivered package units | 308,365 |
| SALES AMOUNT EXCLUDING TAX | Sum `TotalExcludingTax` | 14,700,260.73 |
| TAX AMOUNT | Sum stored `TaxAmount`, not rates | 2,141,698.99 |
| SALES AMOUNT INCLUDING TAX | Sum `TotalIncludingTax` | 16,841,959.72 |
| PROFIT | Sum delivered `Profit`; not an inferred company net-income definition | 5,870,550.66 |
| TOTAL DRY ITEMS | Sum delivered dry-item counts | 300,680 |
| TOTAL CHILLER ITEMS | Sum delivered chiller-item counts | 7,685 |
| # SALES | Count delivered sale records, not distinct invoices | 20,000 |

The persisted [source SQL reference](../../src/lakehouse-sample-model.SemanticModel/DAXQueries/Source.Baseline.sql) independently profiles counts, key integrity, dates, amounts and stable role fixtures. It was queried read-only through the SQL analytics endpoint using `AzureCliCredential`; source data was not downloaded. The required validation-only client `mssql-python==1.16.0` and pinned companions passed advisory checks; no repository dependency manifest was changed.

[Tests.Run](../../src/lakehouse-sample-model.SemanticModel/definition/functions.tmdl) contains 61 assertions covering every measure at total and a four-role fixture, empty selections, individual/combined role counts, nonempty tables, unique/nonblank keys, foreign keys, calendar continuity/coverage and amount-plus-tax reconciliation. The existing PQL.Assert pattern is reused. Integer comparisons are exact; dollar comparisons require matching blank status and absolute error at most `0.01`. Reconciliation is supplemental, not an independent expected-versus-actual test.

Independent fixture row counts: purchasing key `0` = 57; billing key `66` = 58; both customers = 1; invoice `2025-07-14` = 32; delivery `2025-07-15` = 34; both dates = 6. Combining all four roles gives one row, quantity 28, excluding-tax amount 39.20, tax 5.49, including-tax amount 44.69, profit 11.25, dry items 28 and chiller items 0. These are captured source references; live role/blank assertion execution remains unverified.

### Deployment and actual validation evidence

- **Passed:** Offline TOM authoring, serialization and reloading of the persisted folder: 8 tables, 68 columns, 8 measures, 7 relationships and 6 functions. All 8 deployed measures and 8 partitions report `Ready` with empty error messages.
- **Passed:** Isolated deployment using `fab import '/RR - PBI Factory {dev}.Workspace/lakehouse-sample-model.SemanticModel' -i <absolute model folder> -f --format TMDL`. New DEV model ID: `a7dafb65-67e0-407a-adb3-bf6ebe274f55`. Two initial import attempts failed on case-insensitive measure/base-column collisions; hidden base-column names were corrected before the successful creation. No failed target item existed before retries.
- **Passed:** Full XMLA refresh/framing through the already connected modeling tool; every partition is `Ready`, modified around `2026-11-01T19:32:47Z`. Duplicate source role tables worked through XMLA framing here. [Microsoft documents](https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview#considerations-and-limitations) possible duplicate-source errors in Power BI tooling's Edit tables/refresh, so those experiences are not promised.
- **Passed:** SSO readback from `GET workspaces/{workspaceId}/items/{modelId}/connections`: exactly one `Automatic` connection, `AzureDataLakeStorage`, pointing to the approved OneLake URL, with no explicit fixed-identity connection. [Automatic connectivity](https://learn.microsoft.com/en-us/rest/api/fabric/core/items/list-item-connections#connectivitytype) denotes an implicit SSO connection.
- **Passed:** Before the REST authorization failure below, a live XMLA query returned 20,000 sales, quantity 308,365, excluding-tax amount `14700260.73000001` and including-tax amount `16841959.719999995`, agreeing with SQL within tolerance. Engine metrics: 1 storage-engine query, 0 DirectQuery events, `totalDirectQueryCount=0`, activity `6C752C59-5CB1-4111-92A6-746DD370BFD9`, request `0506AEB3-B63D-4823-97DD-96CDAC5C54AF`. No SQL source connector or fallback was added.
- **Passed:** Independent source keys are unique/nonblank; six relationships have zero missing rows; calendar dates are unique and contiguous with 366 days in 2024 and 365 in 2025. Every configured label-to-sort mapping has exactly one sort value. Maximum source per-row amount-plus-tax residual: `9.094947017729282e-12`.
- **Failed, source defect:** 67 sales have delivery dates absent from `dimension_date`: 24 on 2026-01-01, 22 on 2026-01-02, 15 on 2026-01-03 and 6 on 2026-01-04. Their including-tax amount totals 57,598.10. Calendar ends 2025-12-31. Delivery-date filters cannot attribute these rows to a delivered calendar date; the model does not extend the calendar, rewrite keys or accept orphans as a passing fixture.
- **Blocked:** `ENVIRONMENT=DEV AUTH=CLI WORKSPACE_NAME='RR - PBI Factory {dev}' python scripts/test-data.py` returned `401 PowerBINotAuthorizedException` for the new SSO model. The query route was stopped; security was not weakened and no credentials or permission settings were changed. [Execute Queries documentation](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries#limitations) says service principals cannot query SSO-enabled datasets. A supported, approved test identity is needed before retrying. All new Tests.Run result rows, live role/empty checks and representative consumer authorization are therefore **not verified**, not passed.
- **Passed:** Existing live HR tests: 14/14 boolean `true` both before and after deployment. Existing sales tests: 36/36 boolean `true` before and after deployment (post-deployment sales queried separately because the repository runner stopped at the new model).
- **Passed:** Existing source artifacts and scripts are unchanged. Readback preserved report IDs/bindings: sales-overview `c99b1710-e795-4887-82c9-84b5b4ecbb67` and customer-comparison `6679d294-202d-4d28-ac28-2292ee860514` both point to sales `7bcdd4c9-3584-4dd7-9268-c5b15cbba485`; HR report `9ccc8d15-28ef-46d6-8655-564ab7845958` points to HR `6c3215b9-c562-46d8-aef8-73e06969717d`.
- **Not run:** Windows-only BPA on Linux; production deployment; Power BI Desktop/web Edit tables; representative consumer impersonation. No new report was created.
- **Not verified:** Exact capacity SKU/file/row-group guardrails. Workspace reports completed assignment to capacity `631fe32d-fe8b-4e9b-b6a5-61c35dd79fa7`, but that capacity is absent from the caller's visible capacity list. Framing and the measured query succeeded; that is not a full capacity certification.

The broad `scripts/deploy.py` and `scripts/refresh.py` were inspected but not executed: deployment scopes all models/reports, and full refresh would unnecessarily alter randomized existing sales data. Narrow supported import and XMLA framing preserved unrelated artifacts and bindings. Resolve the source-calendar defect and test-identity blocker before marking this delivery Implemented.
