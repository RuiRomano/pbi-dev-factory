# Direct Lake model for lakehouse_sample

**Status:** Draft
**Updated:** 2026-11-01

## Goal
Create a source-controlled Direct Lake semantic model over `lakehouse_sample` in `RR - PBI Factory {dev}`, following the team's star-schema design and measure conventions. This spec addresses [issue #19](https://github.com/RuiRomano/pbi-dev-factory/issues/19). Implementation starts only after review and approval.

## Scope
- Add: A separate model at [src/lakehouse-sample.SemanticModel](../../src/lakehouse-sample.SemanticModel), including `.platform`, `definition.pbism`, TMDL metadata and `Tests.Run` assertions.
- Change: After approval, document the implemented model under [docs/project](../project).
- Keep unchanged: Existing `sales` and `hr` models, reports and bindings, lakehouse data, workspace permissions, deployment scripts and existing environment mappings. No new report, source transformations or production deployment.

## Approach
Read-only Fabric discovery on 2026-11-01 confirmed the workspace has a completed capacity assignment and the lakehouse contains six managed Delta tables. Workspace ID: `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38`. Lakehouse ID: `d3065cfd-ff4d-4bb0-aa89-d27d97c8e011`. Column names and types below were inspected with `fab table schema`; grain, key integrity and aggregate values have not yet been verified.

Use [Direct Lake on OneLake](https://learn.microsoft.com/en-us/fabric/fundamentals/direct-lake-overview), which does not fall back to DirectQuery. Define one shared OneLake source expression and entity partitions with explicit source-column mappings. Keep data preparation upstream. Match the existing models' compatibility level 1702 for DAX test functions, subject to target-engine support. Confirm capacity guardrails and the connection identity before deployment; credentials must not appear in model files. Only DEV source binding is in scope.

| Model table | Delta source | Proposed key and role |
| --- | --- | --- |
| Sales | `fact_sale` | `SaleKey`; candidate invoice-line grain, pending confirmation |
| City | `dimension_city` | `CityKey`; geography |
| Customer | `dimension_customer` | `CustomerKey`; purchasing customer |
| Bill To Customer | `dimension_customer` | `CustomerKey`; separate billing role |
| Product | `dimension_stock_item` | `StockItemKey`; stock item, named consistently with the existing sales model |
| Employee | `dimension_employee` | `EmployeeKey`; salesperson |
| Calendar | `dimension_date` | `Date`; invoice-date role |
| Delivery Calendar | `dimension_date` | `Date`; separate delivery-date role |

Use active, single-direction, one-to-many relationships from dimension keys to `Sales`: `CityKey`, `CustomerKey`, `BillToCustomerKey`, `StockItemKey`, `SalespersonKey`, `InvoiceDateKey` and `DeliveryDateKey`, respectively. Validate unique, nonblank dimension keys and matching fact keys before creating relationships. Do not use many-to-many filtering to conceal source defects.

Keep business labels and slicing attributes, hide keys and aggregation-only columns, and set numeric identifiers and attributes to no summarization. Preserve source meaning and types; money fields are currently `double`, while postal codes and barcodes are also `double`. Do not silently round amounts or claim to recover leading zeros. Omit technical identifiers and nonessential numeric attributes from the initial model. Use the source date table, validate full-year coverage and date uniqueness, mark both calendar roles as date tables, and set chronological label sorting. Do not infer fiscal rules from other sample models.

Propose these explicit measures in `Sales`: `SALES QUANTITY` sums `Quantity`; `SALES AMOUNT EXCLUDING TAX` sums `TotalExcludingTax`; `TAX AMOUNT` sums `TaxAmount`; `SALES AMOUNT INCLUDING TAX` sums `TotalIncludingTax`; `PROFIT` sums `Profit`; `TOTAL DRY ITEMS` sums `TotalDryItems`; `TOTAL CHILLER ITEMS` sums `TotalChillerItems`; `# SALES` counts rows. Confirm additivity and units before implementation. Do not sum unit prices or tax rates, or label stored amounts as net revenue without evidence. Provide descriptions and formats, with no assumed currency symbol. Discourage implicit measures.

Reuse the existing `PQL.Assert` and `Tests.Run` pattern. Capture independent source aggregates and stable filtered fixtures before implementing each measure's assertion. Develop offline in `src/`, then use [scripts/deploy.py](../../scripts/deploy.py), [scripts/refresh.py](../../scripts/refresh.py) and [scripts/test-data.py](../../scripts/test-data.py) against the approved DEV target. These scripts operate across repository artifacts, so review existing workspace bindings and the publish scope before running them.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md): star schema, plural facts and singular dimensions, readable UPPERCASE measures in their subject tables, explicit aggregations with hidden base columns, and at least one `Tests.Run` assertion per new measure. Follow the required company context for descriptions without assuming this sample has the same currency, fiscal calendar or security policy.
- Deviations: None proposed. Existing naming differences remain untouched.

## Acceptance checks
- The TMDL folder loads without errors. All included source mappings, relationships, sort columns and DAX functions resolve. Local BPA passes for the new model on Windows; report it as not run on Linux.
- Deployment creates `lakehouse-sample` in the approved DEV workspace without replacing another model or rebinding reports. Framing succeeds, every included source table has rows, and representative live queries execute in Direct Lake mode, with engine evidence rather than results alone.
- Source profiling proves dimension-key uniqueness, nonblank keys, matching foreign keys and valid calendar coverage. Purchasing versus billing and invoice versus delivery filters return the independently expected subsets, including combined role filters.
- Every proposed measure has a `Tests.Run` assertion with an independently established expected result. Verify totals and filtered contexts, amount-plus-tax reconciliation within an agreed floating-point tolerance, and intentional blank behavior. The data-test script requires boolean `true` in every `Passed` row.
- Connection identity and consumer access satisfy the approved security decision. Test any approved security restrictions with representative consumers; hidden fields are not access controls.
- Existing model and report files and bindings remain unchanged, and existing `sales` and `hr` data tests still pass after the authorized deployment. Record actual validation evidence before marking the spec Implemented.

## Open questions
- Confirm the proposed model name, invoice-line grain, measure definitions and separate billing/delivery roles. Which currency and units do the amount and item-count columns use, and are all proposed totals additive?
- Source aggregate profiling was not performed during this spec pass. Are there duplicate or missing keys, sentinel dates, empty tables or precision issues that require data-engineering fixes before implementation?
- Does the delivered fiscal calendar match the intended reporting calendar? Should floating-point amounts remain as delivered, and what reconciliation tolerance is acceptable?
- Which consumers need access, and should the connection use SSO or a fixed identity? Are country-based RLS, OLS or OneLake security restrictions required? Confirm the supported identity, capacity limits and engine features before building; do not assume unrestricted access.

## Change log
- 2026-11-01: Created a draft from repository conventions and read-only lakehouse discovery. No model files changed, deployment performed or refresh requested. Awaiting review.
