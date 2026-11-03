# Market basket analysis

**Status:** Draft
**Updated:** 2026-11-03

## Goal
Address issue #36: help business stakeholders identify stores and product categories that generate larger baskets and use that comparison to guide product-mix decisions.

## Scope
- Change: Add one basket-size measure to the existing sales semantic model, assertions in `Tests.Run`, and a separate `market-basket-analysis` report and PBIP entry point under `src/`. Update the affected project documentation after implementation.
- Keep unchanged: Existing measures, tests, reports, relationships, source queries, security and developer-authored scripts. Product affinity, association rules and product recommendations are outside scope.

## Approach
The [sales model](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) contains order and line numbers, quantity, store and product keys. `Sales Qty` sums quantity; `# Sales` counts sales rows and must not be used as a basket count. [Relationships](../../src/sales.SemanticModel/definition/relationships.tmdl) connect Sales to Store, Product, Customer and Calendar. The dimensions expose `Store[Store]` and `Product[Category]`. Order-key uniqueness and data quality have not been verified against live data.

Propose visible `Sales[AVERAGE BASKET SIZE]` as units per distinct qualifying order, reusing `Sales Qty`, with a decimal format and a description stating the approved definition and filter behavior. This is a proposal, not an approved business definition. Confirm O1 and O2 before writing DAX. Profile order numbers across stores, customers and dates before choosing the basket key; do not assume globally unique order numbers. Verify blank keys and nonpositive quantities and agree their treatment if present. Recalculate totals from qualifying units and baskets, not averages of store or category averages. Return blank for no qualifying baskets.

Propose a one-page `market-basket-analysis.Report`, bound by relative path to `sales.SemanticModel`, with a title and metric-definition subtitle, a summary value, descending horizontal rankings by store and category, and a store/category matrix. Use date, store and category filters in the filter pane with no slicers. Chart selection should filter the other data visuals. Label category scope explicitly so category contribution is not confused with whole-basket size. Use Contoso's Cloud canvas, Midnight text, Cornflower accents, Segoe UI and the Fold brand signature. Finalize the report layout contract after the metric questions are resolved.

After approval, implement against the local source of truth, validate locally, deploy through the existing `scripts/deploy.py`, run live data checks in the configured development workspace, and preview the report against that model. Do not edit scripts or deploy during this draft-spec phase.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md): explicit uppercase measure in Sales, readable description, appropriate format and `Tests.Run` coverage; preserve the star schema and unrelated names.
- Applies: [Report rules](../../.agents/skills/team-practices/references/rules/report-rules.md): Contoso theme and design standards, no more than one slicer and no more than 20 visuals per page. Use accessible contrast, chart alt text and a rendered review.
- Deviations: None planned. Implementation is blocked pending business-definition confirmation and spec approval.

## Acceptance checks
- For the proposed units definition, verified baskets containing two and four units return 3.00 units per basket. Multiple lines in one order count as one basket; repeated order numbers belonging to different baskets must not merge.
- Store, category, combined store/category and date filters follow the approved O2 behavior. Include a verified multi-category basket to distinguish category-only units from whole-basket units.
- Unequal basket counts across stores produce the weighted grand total from units and baskets, not the unweighted average of displayed store averages. No qualifying sales returns blank. Cover any observed blank keys, zero quantities or returns with explicit assertions.
- Add assertions to [Tests.Run](../../src/sales.SemanticModel/definition/functions.tmdl) using existing test patterns. All pre-existing assertions and captured baseline results for `Sales Qty`, `Sales Amount` and `# Sales` remain unchanged. The new measure loads without errors.
- The new report opens with valid bindings, shows both descending rankings and the matrix, exposes the agreed filters, and displays results matching independent model queries. Review rendered screenshots and cross-filter behavior against the approved definition and Contoso rules.
- Run existing local BPA where supported, deploy with `scripts/deploy.py`, refresh only as required, and run `scripts/test-data.py`. Record passed, failed and unavailable checks separately; do not treat deployment alone as proof of correctness.

## Open questions
O1 - Should basket size mean average units per order (recommended), distinct products per order, or monetary value per order? If value is chosen, currency normalization must be agreed before cross-store comparison.

O2 - For a category, should the measure count only that category's units in orders containing it (recommended for category contribution), or all units in the full baskets containing that category? Store and date selections should continue to apply in either case.

## Change log
- 2026-11-03: Drafted the code-grounded proposal for issue #36. Recorded metric and category-scope decisions for stakeholder review. No model or report implementation, deployment or live tests performed.
