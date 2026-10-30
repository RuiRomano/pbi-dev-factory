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

## Change log
