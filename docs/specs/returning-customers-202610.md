# Returning customers

**Status:** Implemented
**Updated:** 2026-10-30

## Goal
Add `Sales[# Returning Customers]` to the sales semantic model, following the classification and filter behavior of `Sales[# New Customers]`. Returning customers are customers with sales in the current context who are not counted as new in that same context.

## Scope
- Change: Add one visible measure in `Sales` and corresponding assertions in `Tests.Run`.
- Keep unchanged: Existing measures, existing tests, data sources, schema, relationships, report definitions.

## Approach
The existing measures live in [Sales.tmdl](../../src/sales.SemanticModel/definition/tables/Sales.tmdl). `# Customers (w/ Sales)` counts distinct sales customer keys. `# New Customers` derives first-purchase dates using `ALLSELECTED` on Customer and Calendar, clears the Calendar Date filter during that calculation, then applies customer/date lineage with `TREATAS` and `KEEPFILTERS`. Product, category, brand and other remaining filters still affect that classification; it is not an unconditional lifetime-first-purchase definition.

Implement `# Returning Customers` as the difference between `# Customers (w/ Sales)` and `# New Customers`, reusing both measures rather than copying their first-purchase logic. The developer confirmed that a customer counted as new in a period must not also count as returning in that period, even if they purchase again. Evaluate totals in their own filter context, not as sums of daily or monthly counts.

Match the existing customer measures: home table `Sales`, integer format `#,##0`, no display folder. Add a description explaining the complementary definition and inherited filter scope. Return blank when there are no customers with sales, and zero when all customers with sales are new. No new data source or stored first-purchase column is needed.

Extend `Tests.Run` in [functions.tmdl](../../src/sales.SemanticModel/definition/functions.tmdl) using the existing PQL assertions. Reuse its customer/category/brand/date fixtures after confirming their sales history during implementation. Only the two single-brand assertions exist in the source; add multi-brand coverage using those same customers.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Keep the star schema unchanged, place the explicit measure in the fact table it describes, match existing naming and add tests in `Tests.Run`.
- Deviations: None planned. The retired `team-rules` skill is absent from the working tree; use the rules provided by `team-practices`.

## Acceptance checks
- Customer 102075, Games and Toys, Southridge Video, 2017-06-27: confirm the existing first-purchase fixture still returns one new customer and the returning measure returns zero.
- Customer 357592, Cell phones, Contoso, 2019-12-25: confirm sales and an earlier qualifying purchase exist; expect one returning customer and zero new customers.
- Mirror the existing multi-brand fixtures: earlier purchases in selected brands exclude a customer from new and include them in returning when they have current sales; purchases only in excluded brands or categories must not change the existing new-customer classification.
- Multiple sales rows and same-day purchases count a customer once. A period containing both first and later purchases counts that customer as new only.
- For date rows, customer rows, category/brand selections, non-contiguous date selections and grand totals, new plus returning equals customers with sales in the same context. Totals recalculate classification rather than sum row counts.
- No sales returns blank; sales from only new customers returns zero returning customers.
- All pre-existing `Tests.Run` assertions and baseline results for both reused measures remain unchanged. The new measure loads without errors and has the specified visibility, format and description.

## Open questions
None.

## Implementation and validation

Added visible `Sales[# Returning Customers] = [# Customers (w/ Sales)] - [# New Customers]`, with integer format `#,##0`, no display folder and a description of its complementary definition and inherited filter scope. Existing measures, assertions, functions, data sources, schema, relationships and report definitions are unchanged.

Saved to local TMDL and deployed with `python .\scripts\deploy.py` to `RR - PBI Factory {dev}`, semantic model `sales` (`7bcdd4c9-3584-4dd7-9268-c5b15cbba485`). The script also republished the unchanged `sales-overview` report. `python .\scripts\refresh.py` completed successfully. Live measure metadata is Ready, Int64 and matches the requested visibility, format, description and empty display folder.

`python .\scripts\test-data.py` returned boolean true for all 36 `Tests.Run` assertions, including the original four. The 32 added assertions cover the required classifications, confirmed historical purchases, multiple sale rows, same-day purchases, period and non-contiguous totals, blank versus zero and reconciliation at date/month/customer/category-brand rows and totals. Customer 215446 on 2018-06-25 supplies a verified two-row returning-customer fixture with an earlier purchase on 2017-07-12.

| Acceptance check | Result | Evidence |
| --- | --- | --- |
| First purchase fixture | Passed | Customer 102075, Games and Toys, Southridge Video, 2017-06-27: one new, zero returning. |
| Repeat purchase fixture | Passed | Customer 357592, Cell phones, Contoso, 2019-12-25: one customer with sales, zero new, one returning; first qualifying purchase 2017-11-08. |
| Selected and excluded brands/categories | Passed | Customer 102075 on 2019-12-04: earlier selected Southridge Video makes the customer returning; excluded brands/categories preserve new classification; including the earlier Contoso category makes the customer returning. |
| Multiple rows and period classification | Passed | Three first-day rows count one new customer; two repeat-day rows count one returning customer. Periods containing first and later sales count the customer as new only. |
| Rows and totals | Passed | Reconciliation assertions pass for date, month, customer and category/brand rows and totals, including non-contiguous selections. Independent per-customer first-sale calculations found zero mismatches across 725 date, 1,974 customer, five year and 111 year/category/brand results including totals. |
| Blank and zero | Passed | No-sales fixture returns blank; first-purchase fixtures return numeric zero. |
| Regression and metadata | Passed | Original four assertions remain unchanged and pass. Both reused measures match the five year/total baseline rows and eight fixture scopes. Live measure metadata is valid. |

Baseline and post-refresh customer counts are identical:

| Context | Customers with sales | New customers | Returning customers |
| --- | --- | --- | --- |
| Grand total | 1,973 | 1,973 | 0 |
| 2017 | 394 | 394 | 0 |
| 2018 | 850 | 843 | 7 |
| 2019 | 621 | 598 | 23 |
| 2020 | 146 | 138 | 8 |

The grand total is intentionally not the sum of yearly returning counts. For customer 102075 with only 2017-06-27 and 2019-12-04 selected, returning counts are zero and one on the date rows, but zero at the total.

Local BPA command `& .\scripts\bpa\bpa.ps1 -src @('.\src')` analyzed `sales.SemanticModel` and `sales-overview.Report` using [semantic-model rules](../../scripts/bpa/bpa-rules-semanticmodel.json) and [report rules](../../scripts/bpa/bpa-rules-report.json). Exit status was zero. There were 72 existing severity-2 `PROVIDE_DESCRIPTIONS_FOR_TABLES_MEASURES_AND_COLUMNS` warnings on five tables, 14 existing measures and 53 visible columns. No violations affected the new measure. Existing unrelated findings were not changed.

Updated the [model documentation](../project/sales.semantic-model.md) and [artifact catalog](../project/README.md), including the current test and refresh commands. Both artifacts retain one document; report screenshots were unchanged. The catalog's pre-existing link to the absent semantic-model-descriptions spec remains outside scope. Desktop reload, key uniqueness and security were not tested because they are outside this measure-only change; live correctness was verified in Fabric DEV.

## Change log
- 2026-10-30: Developer approved implementation, local BPA, deployment to the configured Fabric development workspace, refresh and live tests. Confirmed both customer histories and captured the existing four passing assertions and customer-count baseline before changes.
- 2026-10-30: Implemented the complementary returning-customer measure and 32 assertions without modifying existing definitions. Persisted TMDL, completed local BPA, deployed and refreshed DEV, passed all 36 assertions and baseline comparisons, and independently checked 2,815 grouped results. Updated model documentation and the catalog. No business-rule deviations; existing unrelated BPA warnings and the missing legacy documentation link remain recorded above.
