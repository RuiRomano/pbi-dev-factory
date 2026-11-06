# Market basket analysis

**Status:** In progress
**Updated:** 2026-11-06

## Goal
Help store operations and merchandising compare which stores and product categories have larger baskets.

## Scope
- Change: Add `Sales[# BASKETS]`, `Sales[AVERAGE BASKET SIZE]`, focused `Tests.Run` assertions and a separate `basket-size-analysis` report and PBIP entry point.
- Keep unchanged: Existing measures, relationships, sources, security, reports and deployment scripts. Product affinity, recommendations and monetary basket value are out of scope.

## Approach
Use the existing [sales model](../../src/sales.SemanticModel/definition/tables/Sales.tmdl), whose order number identifies a basket and whose rows are order lines. For this demo, define larger baskets as more units per order, not more lines or higher spend. `# BASKETS` counts distinct nonblank order numbers. `AVERAGE BASKET SIZE` divides units on those orders by their distinct count and returns blank when there are no orders. Both retain date, store, customer and product filters. In a category view, count only the selected category's units and orders containing that category, not the full contents of those orders. Totals recalculate the ratio, rather than averaging store or category averages.

Create [basket-size-analysis.pbip](../../src/basket-size-analysis.pbip) and `src/basket-size-analysis.Report`, bound by relative path to the shared sales model. One page contains summary cards for average units per basket and basket count, descending store and category bar charts, and a store/category matrix with units, baskets and average size. Date, country, store and category use the filter pane; no slicers are needed. Explain the category interpretation on the page. Use the existing deployment, refresh and data-test scripts against the configured development workspace.

## Team rules
- Applies: Uppercase explicit measures in `Sales`, business-friendly descriptions and formats, and assertions in the existing `Tests.Run`. Contoso theme, Segoe UI, restrained Cornflower accents, Cloud canvas, accessible labels, no overlapping visuals and fewer than 20 visuals.
- Deviations: The issue explicitly authorizes self-approval and implementation for this demo. No separate approval turn is required. Linux skips Windows-only BPA. If live validation or rendering is blocked, retain In progress status and report the blocker.

```yaml
Design Brief:
  generated_by: powerbi-report-cli
  contract_version: 1
  mode: greenfield
  design_identity:
    tone: Contoso quiet confidence
    signature: Left-aligned Segoe UI headlines with restrained Cornflower accents
  navigation_model: none
  color_map:
    - measure: Sales[AVERAGE BASKET SIZE]
      color: "#536CE5"
  pages:
    - name: Basket analysis
      role: landing
      archetype: Analytical
      layout_variant: B
      variant_rationale: Two dimension rankings and an intersection matrix need full width without a filter rail.
      navigation: []
      layout_contract:
        canvas: { width: 1920, height: 1080, margin: 32, gutter: 24, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 13, 2]
            summary: [1, 2, 13, 4]
            stores: [1, 4, 7, 9]
            categories: [7, 4, 13, 9]
            detail: [1, 9, 13, 13]
        placements:
          - { id: page_title, region: header, kind: textbox, text: "Market basket analysis" }
          - { id: definition, region: summary, kind: textbox, text: "Basket size is units per order. Category views include only that category's units and orders. Use the filter pane to narrow date, country, store or category.", slot: 1, of: 2 }
          - { id: basket_summary, region: summary, kind: cardVisual, field_bindings: ["Sales[AVERAGE BASKET SIZE]", "Sales[# BASKETS]"], slot: 2, of: 2 }
          - { id: stores, region: stores, kind: barChart, field_bindings: { Category: "Store[Store]", Y: "Sales[AVERAGE BASKET SIZE]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: categories, region: categories, kind: barChart, field_bindings: { Category: "Product[Category]", Y: "Sales[AVERAGE BASKET SIZE]" }, sort_policy: value_desc, color_strategy: measure_match }
          - { id: detail, region: detail, kind: pivotTable, field_bindings: ["Store[Store]", "Product[Category]", "Sales[Sales Qty]", "Sales[# BASKETS]", "Sales[AVERAGE BASKET SIZE]"] }
        space_audit:
          content_cell_count: 132
          placed_cell_count: 132
          empty_cell_pct: 0
          unplaced_regions: []
          largest_region: { name: detail, pct_of_content: 36.4 }
          balance_rationale: Equal rankings answer both questions; the matrix explains intersections and volume without a dominant KPI.
  accessibility:
    alt_text_strategy: Describe each chart's dimension, metric and descending ranking.
    contrast_notes: Midnight text on Cloud or white; Cornflower is reserved for data marks.
  theme:
    base: Team Contoso theme
    user_overrides: Preserve brand colors and Segoe UI.
```

## Acceptance checks
- A multiline order counts once; units, not row count, determine its basket size.
- Verify that each nonblank order number belongs to one store, customer and order date. The pre-change development model has 2,029 orders and no ambiguous or blank order identifiers. Retain an assertion to detect future key reuse.
- At total, store, category and store/category levels, compare the measures with an independent grouping of order lines. Totals use total units divided by distinct orders.
- Blank order identifiers are excluded from both numerator and denominator. An empty selection returns blank, not zero or an error.
- Date and category filtering are retained. Run all existing `Tests.Run` assertions unchanged as regression coverage.
- Load the local TMDL, validate PBIR schemas and bindings, and review rendered screenshots of the saved page against the development model. Verify ranking, matrix and filter behavior.
- Run deployment, refresh and data assertions using the existing scripts when credentials allow it. Record actual results, not intended results.

## Open questions
None. Units per order and category-scoped interpretation are demo decisions approved under the issue's delegated approval.

## Change log
- 2026-11-06: Created and self-approved the demo scope under the issue's explicit authorization; validation evidence is pending.
- 2026-11-06: Independent review requested order-key verification; the live check passed. Chose a distinct report name to avoid replacing existing development reports. New measures follow the written uppercase rule without renaming existing mixed-case measures.
- 2026-11-06: Implemented two measures, 13 basket assertions, a six-visual report with a combined summary card, and artifact documentation. Local TMDL reload passed with 17 measures and four relationships. Independent code review found no significant issues. Existing measure and test definitions were preserved.
- 2026-11-06: Deployment and refresh passed using the existing scripts. All 49 sales assertions (36 existing plus 13 new) and 14 HR assertions returned boolean true. Before refresh, existing sales lines (2,999), units (9,339), sales amount (2,739,908.8958) and customer count (1,973) exactly matched the pre-change baseline; the new average was 4.602759980285855 units across 2,029 baskets.
- 2026-11-06: [Development report](https://app.powerbi.com/groups/0a6ed388-8f6e-40a0-a9ac-df7d1522ba38/reports/a3f23b3f-9cda-49e7-bb88-7a1ec21191ca) and [sales model](https://app.powerbi.com/groups/0a6ed388-8f6e-40a0-a9ac-df7d1522ba38/modeling/3667483b-67dc-44a2-9056-7d01aa1e4fb9) verified through live item listing and measure queries. Report JSON, bounds, non-overlap and theme-color checks passed. Secret scanning passed; CodeQL reported no applicable changed languages. Windows-only BPA is not applicable on Linux. Final report CLI validation, screenshot review and interactive checks remain pending, so status stays In progress.
