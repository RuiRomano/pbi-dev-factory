# Sales basket analysis

**Status:** In progress
**Updated:** 2026-11-05

## Goal
Help merchandising and store operations compare basket sizes across stores and product categories to inform product mix and cross-sell decisions. Addresses #48.

## Scope
- Change: Add `Sales[BASKETS]`, `Sales[AVERAGE BASKET SIZE]`, focused `Tests.Run` assertions and a new one-page `basket-analysis` report.
- Keep unchanged: Existing measures, reports, relationships, sources, security and refresh logic. Product-pair affinity, support, confidence and lift are not part of this basket-size delivery.

## Approach
The [Sales model](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) stores order lines. `# Sales` counts lines, so it is not a basket denominator. Use distinct nonblank `Sales[Order Number]` values as baskets and divide the existing `Sales Qty` by that count. Exclude lines without an order number from both quantities and basket counts. Return blank for no matching baskets. Basket size means product units, not distinct products or monetary value. Store, date, customer and product filters remain active. Category results mean category units per order containing that category, not full-order units. Totals recalculate from units and distinct orders, rather than averaging category or store averages. The current source query preserves quantities and net prices; only time is randomized. Verify that each order number belongs to one store and customer.

Create [basket-analysis.pbip](../../src/basket-analysis.pbip), bound by relative path to `sales.SemanticModel`. One page compares stores and categories with descending horizontal bars and provides a store-by-category matrix with average basket size, baskets and units. Store ranking retains all stores with scrolling, rather than hiding locations through a top-N filter. Use the filter pane for `Calendar[Date]` (order date), country, store, category and brand. Use explicit measures only, descriptive titles and alt text. No slicers or custom visuals.

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
        canvas: { width: 1280, height: 720, margin: 24, gutter: 16, snap: 8 }
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
O1 - Service preview failed with `RENDER_FAILED: CreateReportFailed`, code `401`, request `d890a171-0d3b-46c6-968a-870f0016f343`. Restore service preview access, then capture and review the page and test interactive filtering. Rendering, keyboard navigation and interaction checks remain unverified. The spec stays In progress until these checks pass. The units-per-order definition and category-only interpretation are explicit demo design decisions under the delegated approval.

## Change log
- 2026-11-05: PR validation run 42043543066 found hard-coded bar colours and a page-height warning. Under the user's request to fix PR checks, replaced both bar colours with Contoso palette index 0 and resized the page to 1280 by 720 with adjusted positions and textbox sizes. Measures, queries, filters and ranking are unchanged. BPA rules and scripts remain unchanged.
- 2026-11-05: Corrected report passed CLI validation with zero errors and warnings. Targeted checks confirmed theme references, a maximum page height of 720, six in-bounds non-overlapping visuals and unchanged visual data queries. Full Windows BPA, deployment and data tests are pending the PR pipeline rerun; O1 still blocks rendered validation.
- 2026-11-05: [PR validation run 42047146283](https://github.com/RuiRomano/pbi-dev-factory/actions/runs/42047146283) passed on fix commit `361caa0`: Windows BPA for all models and reports, DEV deployment, refresh and data tests. All 48 Sales assertions and 14 HR assertions passed. The basket report has no remaining report BPA findings. Existing model warnings remain; the average-basket-size whole-number-format warning is retained because a fractional average requires two decimals. Independent review found no significant issues, secret scanning found no secrets, and CodeQL skipped the UI-only fix. O1 remains outside the CI checks.
- 2026-11-05: Inspected the model, team rules and existing tests. Created and reviewed the spec; approved under the user's demo delegation before implementation.
- 2026-11-05: Independent review prompted order-identity checks, exact numeric fixtures, an explicit Calendar date binding and a native top-10 scope. Verified the current partition preserves source quantities despite older documentation suggesting randomization. Changes self-approved under the same demo delegation.
- 2026-11-05: Kept all stores in the ranked chart with scrolling to avoid top-N exclusions and preserve access to smaller locations. Self-approved under the demo delegation. Added both measures and 12 focused assertions; all 12 passed against live data with query-scoped candidate measures before deployment.
- 2026-11-05: Saved and reloaded the local model: five tables, 17 measures and four unchanged relationships. Built the six-visual Contoso report with five filter-pane fields; report CLI 0.5.0 validation passed with zero errors and warnings after increasing title height.
- 2026-11-05: Ran `AUTH=CLI python scripts/deploy.py`, `python scripts/refresh.py` and `python scripts/test-data.py` against `RR - PBI Factory {dev}`. Both models refreshed. All 48 Sales assertions (36 existing, 12 new) and 14 HR regression assertions returned boolean true. An independent per-order average matched 395 store/category rows including the total. Baseline totals remained 2,999 sales lines, 9,339 units, sales amount 2,739,908.8958 and 1,973 customers; basket count is 2,029 and average size is 4.602759980285855 units.
- 2026-11-05: Published report `da9fcaeb-ad27-4640-b3c2-a7d954ba2121` was read back with Sales dataset binding `3667483b-67dc-44a2-9056-7d01aa1e4fb9` in DEV workspace `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38`. The unchanged HR and existing Sales reports were republished by the required repository script. Updated model/report documentation and catalog. Windows-only BPA was not run on Linux. Screenshot validation is blocked by O1; no screenshot was captured.
