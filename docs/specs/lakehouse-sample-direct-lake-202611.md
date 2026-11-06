# Direct Lake model for lakehouse_sample

**Status:** In progress
**Updated:** 2026-11-01

## Goal
Create a source-controlled Direct Lake semantic model over `lakehouse_sample` in `RR - PBI Factory {dev}`, following the team's star-schema design and measure conventions. This spec addresses [issue #19](https://github.com/RuiRomano/pbi-dev-factory/issues/19). Implementation starts only after review and approval.

## Scope
- Add: A separate model at [src/lakehouse-sample-model.SemanticModel](../../src/lakehouse-sample-model.SemanticModel), including `.platform`, `definition.pbism`, TMDL metadata and `Tests.Run` assertions.
- Change: After approval, document the implemented model under [docs/project](../project).
- Keep unchanged: Existing `sales` and `hr` models, reports and bindings, lakehouse data, workspace permissions, deployment scripts and existing environment mappings. No new report, source transformations or production deployment.

## Approach
Read-only Fabric discovery on 2026-11-01 confirmed the workspace has a completed capacity assignment and the lakehouse contains six managed Delta tables. Workspace ID: `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38`. Lakehouse ID: `d3065cfd-ff4d-4bb0-aa89-d27d97c8e011`. Column names and types below were inspected with `fab table schema`; grain, key integrity and aggregate values have not yet been verified.

Use [Direct Lake on OneLake](https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview), which does not fall back to DirectQuery. Define one shared OneLake source expression and entity partitions with explicit source-column mappings. Keep data preparation upstream. Match the existing models' compatibility level 1702 for DAX test functions, subject to target-engine support. Confirm capacity guardrails and the connection identity before deployment; credentials must not appear in model files. Only DEV source binding is in scope.

| Model table | Delta source | Proposed key and role |
| --- | --- | --- |
| Sales | `fact_sale` | Unique delivered `SaleKey` record; exact source grain preserved |
| City | `dimension_city` | `CityKey`; geography |
| Customer | `dimension_customer` | `CustomerKey`; purchasing customer |
| Bill To Customer | `dimension_customer` | `CustomerKey`; separate billing role |
| Product | `dimension_stock_item` | `StockItemKey`; stock item, named consistently with the existing sales model |
| Employee | `dimension_employee` | `EmployeeKey`; salesperson |
| Calendar | `dimension_date` | `Date`; invoice-date role |
| Delivery Calendar | `dimension_date` | `Date`; separate delivery-date role |

Use active, single-direction, one-to-many relationships from dimension keys to `Sales`: `CityKey`, `CustomerKey`, `BillToCustomerKey`, `StockItemKey`, `SalespersonKey`, `InvoiceDateKey` and `DeliveryDateKey`, respectively. Validate unique, nonblank dimension keys and matching fact keys before creating relationships. Do not use many-to-many filtering to conceal source defects.

Keep business labels and slicing attributes, hide keys and aggregation-only columns, and set numeric identifiers and attributes to no summarization. Preserve source meaning and types; money fields are currently `double`, while postal codes and barcodes are also `double`. Do not silently round amounts or claim to recover leading zeros. Omit technical identifiers and nonessential numeric attributes from the initial model. Use the source date table, validate full-year coverage and date uniqueness, mark both calendar roles as date tables, and set chronological label sorting. Do not infer fiscal rules from other sample models.

Approved simple measures in `Sales`: `SALES QUANTITY` sums `Quantity`; `SALES AMOUNT EXCLUDING TAX` sums `TotalExcludingTax`; `TAX AMOUNT` sums `TaxAmount`; `SALES AMOUNT INCLUDING TAX` sums `TotalIncludingTax`; `PROFIT` sums `Profit`; `TOTAL DRY ITEMS` sums `TotalDryItems`; `TOTAL CHILLER ITEMS` sums `TotalChillerItems`; `# SALES` counts rows. Preserve the source SaleKey grain, without asserting invoice-line uniqueness or interpreting this sample as certified net revenue. Do not sum unit prices or tax rates. Dollar formats are approved; no currency code is inferred. Discourage implicit measures.

Reuse the existing `PQL.Assert` and `Tests.Run` pattern. Capture independent source aggregates and stable filtered fixtures before implementing each measure's assertion. Develop offline in `src/`, then use [scripts/deploy.py](../../scripts/deploy.py), [scripts/refresh.py](../../scripts/refresh.py) and [scripts/test-data.py](../../scripts/test-data.py) against the approved DEV target. These scripts operate across repository artifacts, so review existing workspace bindings and the publish scope before running them.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md): star schema, plural facts and singular dimensions, readable UPPERCASE measures in their subject tables, explicit aggregations with hidden base columns, and at least one `Tests.Run` assertion per new measure. Follow the required company context for descriptions without assuming this sample has the same currency, fiscal calendar or security policy.
- Deviations: None proposed. Existing naming differences remain untouched.

## Acceptance checks
- The TMDL folder loads without errors. All included source mappings, relationships, sort columns and DAX functions resolve. Local BPA passes for the new model on Windows; report it as not run on Linux.
- Deployment creates `lakehouse-sample-model` in the approved DEV workspace without replacing another model or rebinding reports. Framing succeeds, every included source table has rows, and representative live queries execute in Direct Lake mode, with engine evidence rather than results alone.
- Source profiling proves dimension-key uniqueness, nonblank keys, matching foreign keys and valid calendar coverage. Purchasing versus billing and invoice versus delivery filters return the independently expected subsets, including combined role filters.
- Every proposed measure has a `Tests.Run` assertion with an independently established expected result. Verify totals and filtered contexts, amount-plus-tax reconciliation within an agreed floating-point tolerance, and intentional blank behavior. The data-test script requires boolean `true` in every `Passed` row.
- Connection identity and consumer access satisfy the approved security decision. Test any approved security restrictions with representative consumers; hidden fields are not access controls.
- Existing model and report files and bindings remain unchanged, and existing `sales` and `hr` data tests still pass after the authorized deployment. Record actual validation evidence before marking the spec Implemented.

## Open questions
- Source profiling found 67 delivery-date foreign keys outside the delivered calendar (delivery dates extend through 2026-01-04; calendar ends 2025-12-31). No source changes, invented dates or masking are authorized. Delivery coverage remains a required failing check until corrected upstream.
- Representative consumer access and the assigned capacity SKU still require verification. Use approved SSO; do not add model RLS/OLS or change source/workspace permissions.

## Approved review decisions and implementation basis
- 2026-11-01: Developer approved implementation as `lakehouse-sample-model`, preserving exact lakehouse grain, simple KISS measures, dollar display, delivered fiscal attributes, delivered floating-point money and SSO. Separate purchasing/billing and invoice/delivery roles remain in scope.
- Authoring uses the functioning offline modeling tools; TMDL is persisted to `src/` before deployment/testing. BPA is not applicable to this Linux runtime.
- Independent read-only SQL profiling uses the delivered SQL analytics endpoint with `AzureCliCredential`; no source data is downloaded. The necessary validation client `mssql-python==1.16.0` and its pinned companions passed advisory checks; repository dependencies remain unchanged.
- Source `SaleKey` is unique across 20,000 rows but `WWIInvoiceID` has only two distinct values. The model therefore describes delivered SaleKey grain, not a proven invoice-line business key.
- Floating-point comparisons use absolute dollar tolerance `0.01`, with matching blank status; integer totals compare exactly. Maximum source row amount-plus-tax residual was `9.094947017729282e-12`.

## Validation and deployment evidence
- Persisted to `src/lakehouse-sample-model.SemanticModel` using offline modeling tools, then successfully reloaded: 8 tables, 68 columns, 8 measures, 7 relationships, 6 functions, compatibility 1702. All deployed measures/functions/partitions inspected report `Ready` without errors.
- Isolated DEV deployment succeeded with `fab import '/RR - PBI Factory {dev}.Workspace/lakehouse-sample-model.SemanticModel' -i <absolute model folder> -f --format TMDL`; model ID `a7dafb65-67e0-407a-adb3-bf6ebe274f55`. Initial import name-collision failures were corrected in hidden base columns; no existing item was replaced.
- Full XMLA framing succeeded and all eight partitions are Ready. OneLake SSO readback is one `Automatic`/`AzureDataLakeStorage` connection at the approved source URL, without a fixed-identity binding.
- Live XMLA total query returned 20,000 sales, 308,365 quantity, `14700260.73000001` excluding tax and `16841959.719999995` including tax, matching independent SQL within tolerance. Engine evidence: one storage-engine query and zero DirectQuery events; activity `6C752C59-5CB1-4111-92A6-746DD370BFD9`, request `0506AEB3-B63D-4823-97DD-96CDAC5C54AF`.
- Independent source profiling passed unique/nonblank source keys, six orphan-free relationships, all included chronological sort mappings, 731 contiguous calendar dates and full 2024/2025 calendar coverage. It **failed** delivery coverage: 67 rows with delivery dates 2026-01-01 through 2026-01-04, including-tax amount 57,598.10, outside the delivered calendar. Source dates are not masked or invented.
- 61 `Tests.Run` assertions are persisted, including every measure at total/four-role context and empty selection, role-filter fixtures, key/orphan/nonempty/calendar checks and reconciliation. Live execution is **blocked**, not passed: the existing repository test runner returned `401 PowerBINotAuthorizedException` for this SSO model. The REST route was stopped without changing identity/security. Microsoft [documents](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries#limitations) that service principals are unsupported for SSO-enabled datasets; an approved supported test identity is required.
- Existing HR 14/14 and sales 36/36 tests passed before and after deployment. Existing source/model/report files and all three deployed report bindings remain unchanged. See [catalog documentation](../project/README.md#lakehouse-sample-model) for IDs, SQL totals, fixtures, commands and detailed results.
- BPA not run on Linux. Representative consumer permissions and exact assigned capacity SKU/guardrails are not verified. Broad deployment/refresh scripts were inspected, but narrow supported import/XMLA framing avoided unrelated replacement/rebinding or randomized sales refresh. No production, data or permission changes.
- Final static checks passed: JSON parsing, all 68 explicit source mappings, 61 assertion call sites, eight Direct Lake partitions without a SQL connector, compatibility 1702, case-insensitive field/measure uniqueness, updated-content links and `git diff --check`. The persisted independent source SQL executed successfully with six aggregate result sets. These checks do not replace blocked live Tests.Run execution.

## Change log
- 2026-11-01: Created a draft from repository conventions and read-only lakehouse discovery. No model files changed, deployment performed or refresh requested. Awaiting review.
- 2026-11-01: Approval recorded; implementation started. Source profiling confirmed unique/nonblank dimension keys and 0 orphans on six relationships, but 67 unmatched delivery dates. Source calendar has all 366 days of 2024 and 365 days of 2025; delivered fiscal-year labeling is retained, not replaced with company calendar rules.
- 2026-11-01: Complete model metadata and independent SQL/DAX test references persisted, isolated DEV deployment/framing and SSO readback verified, zero-DirectQuery engine metrics captured, existing regressions/bindings preserved, and existing project catalog updated. Status remains In progress because delivery-date coverage fails and the REST test runner is authorization-blocked; required live assertion/consumer/capacity evidence is incomplete.
