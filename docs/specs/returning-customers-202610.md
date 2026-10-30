# Returning customers

**Status:** Draft
**Updated:** 2026-10-30

## Goal
Add `Sales[# Returning Customers]` to the sales semantic model, following the classification and filter behavior of `Sales[# New Customers]`. Returning customers are customers with sales in the current context who are not counted as new in that same context.

## Scope
- Change: Add one visible measure in `Sales` and corresponding assertions in `Tests.Run`.
- Keep unchanged: Existing measures, existing tests, data sources, schema, relationships, report definitions, refresh behavior and deployment.

## Approach
The existing measures live in [Sales.tmdl](../../src/sales.SemanticModel/definition/tables/Sales.tmdl). `# Customers (w/ Sales)` counts distinct sales customer keys. `# New Customers` derives first-purchase dates using `ALLSELECTED` on Customer and Calendar, clears the Calendar Date filter during that calculation, then applies customer/date lineage with `TREATAS` and `KEEPFILTERS`. Product, category, brand and other remaining filters still affect that classification; it is not an unconditional lifetime-first-purchase definition.

Implement `# Returning Customers` as the difference between `# Customers (w/ Sales)` and `# New Customers`, reusing both measures rather than copying their first-purchase logic. The developer confirmed that a customer counted as new in a period must not also count as returning in that period, even if they purchase again. Evaluate totals in their own filter context, not as sums of daily or monthly counts.

Match the existing customer measures: home table `Sales`, integer format `#,##0`, no display folder. Add a description explaining the complementary definition and inherited filter scope. Return blank when there are no customers with sales, and zero when all customers with sales are new. No new data source or stored first-purchase column is needed.

Extend `Tests.Run` in [functions.tmdl](../../src/sales.SemanticModel/definition/functions.tmdl) using the existing PQL assertions. Reuse its customer/category/brand/date fixtures after confirming their sales history during implementation.

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
Implemented locally in standard mode. Added the visible `Sales[# Returning Customers]` measure with format `#,##0`, no display folder and a description of its complementary definition and inherited filter scope. An explicit no-sales guard preserves blank results. Extended `Tests.Run` with 29 assertions, preserving its eight existing assertions.

The saved TMDL was parsed successfully. Tests used the saved measure and function expressions as query-scoped `DEFINE MEASURE` and `DEFINE FUNCTION` overrides against the existing local Desktop model. All 37 assertions returned boolean `Passed = true`. No live model objects, report definitions, deployment or refresh settings were changed.

| Acceptance check | Result | Evidence |
| --- | --- | --- |
| First purchase: customer 102075, Games and Toys, Southridge Video, 2017-06-27 | Passed | Customers with sales = 1, new = 1, returning = 0. |
| Repeat purchase: customer 357592, Cell phones, Contoso, 2019-12-25 | Passed | Customers with sales = 1, new = 0, returning = 1; earlier qualifying sale confirmed on 2017-11-08. |
| Selected and excluded brands and categories | Passed | All three mirrored fixtures retain the existing new-customer classification and return the expected complementary counts. |
| Multiple rows, same-day purchases and periods containing first and later purchases | Passed | Same-day fixture has two sales rows but one customer and zero returning; the repeat-customer period spans two purchase dates but returns one new and zero returning. |
| Date rows, customer rows, category/brand selections, non-contiguous dates and totals | Passed | Complement assertions passed over three date contexts, four customer contexts and nine category/brand contexts. Returning date rows sum to 1 while their recalculated total is 0. Grand-total complement also passed. |
| Blank with no sales; zero with only new customers | Passed | Strict null assertions passed for the empty fixture; typed zero assertions passed for first-purchase fixtures. |
| Existing tests and reused measure baselines unchanged | Passed | All eight existing assertions passed. Existing model metadata is identical after excluding the new measure and restoring the original `Tests.Run` expression. Baseline remains 1,973 customers with sales, 1,973 new customers and 2,999 sales rows. |
| Measure loads and has required metadata | Passed | Saved folder parsed with five tables and four relationships. New measure state is Ready, visible, correctly formatted and described, without a display folder; its saved expression executed successfully. |

Local BPA ran with `& .\scripts\bpa\bpa.ps1 -src @('.\src')`, using [semantic model rules](../../scripts/bpa/bpa-rules-semanticmodel.json) and [report rules](../../scripts/bpa/bpa-rules-report.json). The semantic model has 72 pre-existing severity-2 warnings for `PROVIDE_DESCRIPTIONS_FOR_TABLES_MEASURES_AND_COLUMNS` on unchanged tables, measures and visible columns. The new measure has no findings. These unrelated missing descriptions were not changed.

The unchanged report was checked separately with verbose JSON output to verify the initially silent analyzer output. All 17 reported results have `Pass = true`; the unused-custom-visual rule reported that `/publicCustomVisuals` could not be evaluated and returned an empty result, so that subcheck is not verified. No report changes are in scope.

Deployment, refresh, Fabric data tests and project-documentation generation were not run because they are outside the approved local-only scope. Desktop was not reloaded. Reload the project before saving it in Desktop to avoid overwriting the external source edits.

## Change log
- 2026-10-30: Implemented the returning-customer measure and 29 new assertions. All 37 local Desktop assertions passed using query-scoped definitions from saved source. Confirmed fixture history, unchanged existing metadata and baselines, and required measure metadata. Recorded 72 unrelated existing BPA warnings and the report analyzer limitation. No deployment, refresh or report changes.