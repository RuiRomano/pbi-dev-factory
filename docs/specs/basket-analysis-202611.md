# Sales basket analysis

**Status:** Approved
**Updated:** 2026-11-05

## Goal
Help merchandising and store operations compare basket sizes across stores and product categories to inform product mix and cross-sell decisions. Addresses #48.

## Scope
- Change: Add `Sales[BASKETS]`, `Sales[AVERAGE BASKET SIZE]`, focused `Tests.Run` assertions and a new one-page `basket-analysis` report.
- Keep unchanged: Existing measures, reports, relationships, sources, security and refresh logic. Product-pair affinity, support, confidence and lift are not part of this basket-size delivery.

## Approach
The [Sales model](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) stores order lines. `# Sales` counts lines, so it is not a basket denominator. Use distinct nonblank `Sales[Order Number]` values as baskets and divide the existing `Sales Qty` by that count. Exclude lines without an order number from both quantities and basket counts. Return blank for no matching baskets. Basket size means product units, not distinct products or monetary value. Store, date, customer and product filters remain active. Category results mean category units per order containing that category, not full-order units. Totals recalculate from units and distinct orders, rather than averaging category or store averages. The current source query preserves quantities and net prices; only time is randomized. Verify that each order number belongs to one store and customer.

Create [basket-analysis.pbip](../../src/basket-analysis.pbip), bound by relative path to `sales.SemanticModel`. One page compares stores and categories with descending horizontal bars and provides a store-by-category matrix with average basket size, baskets and units. Store ranking uses a native top-10 filter by basket size; the matrix retains all stores. Use the filter pane for `Calendar[Date]` (order date), country, store, category and brand. Use explicit measures only, descriptive titles and alt text. No slicers or custom visuals.

```yaml
Design Brief:
  generated_by: powerbi-report-cli
  contract_version: 1
  mode: greenfield
  design_identity:
    tone: Quiet Contoso clarity, with Cloud canvas, white panels and Segoe UI typography
    signature: Cornflower comparisons with restrained Midnight headings and a Contoso wordmark
  navigation_model: none
  color_map:
    - { measure: "Sales[AVERAGE BASKET SIZE]", color: "#536CE5" }
  pages:
    - name: Where are baskets larger?
      role: landing
      archetype: Comparative
      layout_variant: C
      variant_rationale: Rank many stores on one metric; use sorted bars instead of a slope graph because there is no second-period comparison.
      navigation: []
      page_background: "#F6F7FB"
      layout_contract:
        canvas: { width: 1920, height: 1080, margin: 32, gutter: 24, snap: 8 }
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 11, 2]
            brand: [11, 1, 13, 2]
            stores: [1, 2, 7, 8]
            categories: [7, 2, 13, 8]
            detail: [1, 8, 13, 12]
            definition: [1, 12, 13, 13]
        placements:
          - { id: page_title, region: header, kind: textbox, text: "Where are baskets larger?" }
          - { id: brand, region: brand, kind: textbox, text: contoso }
          - id: stores
            region: stores
            kind: barChart
            purpose: Which stores have the most units per basket?
            field_bindings: { Category: "Store[Store]", Y: "Sales[AVERAGE BASKET SIZE]", Tooltips: "Sales[BASKETS]" }
            sort_policy: value_desc
            color_strategy: measure_match
          - id: categories
            region: categories
            kind: barChart
            purpose: Which categories have the most category units per basket?
            field_bindings: { Category: "Product[Category]", Y: "Sales[AVERAGE BASKET SIZE]", Tooltips: "Sales[BASKETS]" }
            sort_policy: value_desc
            color_strategy: measure_match
          - id: detail
            region: detail
            kind: pivotTable
            purpose: How do basket size and volume compare within each store and category?
            field_bindings: { Rows: ["Store[Store]", "Product[Category]"], Values: ["Sales[AVERAGE BASKET SIZE]", "Sales[BASKETS]", "Sales[Sales Qty]"] }
            sort_policy: value_desc
            color_strategy: none
          - { id: definition, region: definition, kind: textbox, text: "Basket size = units per order. Category filters count category units only. Orders can appear in several categories; totals recalculate." }
        space_audit:
          content_cell_count: 132
          placed_cell_count: 132
          empty_cell_pct: 0
          unplaced_regions: []
          largest_region: { name: detail, pct_of_content: 36.36 }
          balance_rationale: Two balanced ranked comparisons above a full-width four-row detail region; the footer explains the metric rather than repeating it.
  accessibility:
    alt_text_strategy: Describe the comparison and its filter scope without inventing data findings
    contrast_notes: Midnight text on Cloud or white; Cornflower marks on white; labeled values do not depend on color
  theme:
    base: Team Contoso theme
    user_overrides: Preserve the team palette and Segoe UI; remove textbox padding and borders explicitly
```

## Team rules
- Applies: Preserve the star schema; keep uppercase measures with descriptions and formats in `Sales`; reuse `Sales Qty`; add `Tests.Run` coverage for each new measure. Apply the Contoso theme and design standards, no more than one slicer and fewer than 20 visuals.
- Deviations: The user explicitly delegated spec approval for this demo and requested immediate implementation. This spec is self-approved under that delegation. No separate approval turn is required.

## Acceptance checks
- One order with several lines counts once; blank order numbers never count as baskets.
- Verify order numbers belong to one store and customer. Use exact numeric sample fixtures for basket count and average units; the current source has no blank-order rows, so blank-order behavior is checked with an empty selection rather than a populated blank-order fixture.
- Average basket size matches an independent average of per-order unit totals, including store/category breakdowns and grand totals. Category selections do not include units from other categories.
- No matching sales returns blank for both new measures. Weighted totals use all selected units and orders, not an average of displayed averages.
- Existing `Tests.Run` assertions still pass; unchanged measures match their baseline before a source refresh.
- The new report validates, binds to Sales, uses the Contoso theme, ranks stores/categories and exposes filter-pane controls and volume context.
- Run the existing deployment, refresh and data-test scripts against DEV. Preview the latest report against the deployed model and review a fresh page screenshot. Skip Windows-only BPA on Linux and record the limitation.

## Open questions
None. The chosen units-per-order definition and category-only interpretation are explicit demo design decisions under the delegated approval.

## Change log
- 2026-11-05: Inspected the model, team rules and existing tests. Created and reviewed the spec; approved under the user's demo delegation before implementation.
- 2026-11-05: Independent review prompted order-identity checks, exact numeric fixtures, an explicit Calendar date binding and a native top-10 scope. Verified the current partition preserves source quantities despite older documentation suggesting randomization. Changes self-approved under the same demo delegation.
