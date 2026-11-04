# Market basket analysis

**Status:** In progress
**Updated:** 2026-11-04

## Goal
Address issue #36: help business stakeholders identify stores and product categories that generate larger baskets and use that comparison to guide product-mix decisions.

## Scope
- Change: Add one basket-size measure to the existing sales semantic model, assertions in `Tests.Run`, and a separate `market-basket-analysis` report and PBIP entry point under `src/`. Update the affected project documentation after implementation.
- Keep unchanged: Existing measures, tests, reports, relationships, source queries, security and developer-authored scripts. Product affinity, association rules and product recommendations are outside scope.

## Approach
The [sales model](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) contains order and line numbers, quantity, store and product keys. `Sales Qty` sums quantity; `# Sales` counts sales rows and must not be used as a basket count. [Relationships](../../src/sales.SemanticModel/definition/relationships.tmdl) connect Sales to Store, Product, Customer and Calendar. The dimensions expose `Store[Store]` and `Product[Category]`. Basket-key profiling and source reconciliation are recorded below; this does not certify unrelated data quality.

Approval: @RuiRomano approved implementation in PR comment 6617867994, resolving O1 as distinct products and O2 as category-only scope. “Category-only units” means distinct products within the selected category under the O1 decision, not a sum of Quantity.

Implement visible `Sales[AVERAGE BASKET SIZE]` as the average **per-basket DISTINCTCOUNT of ProductKey**, with format `#,##0.00` and a description stating its definition and filter behavior. Group baskets by Order Number, StoreKey, Order Date and CustomerKey; do not merge independently reused order numbers. Preserve the current date, store, category and other filters. A category counts only selected-category products in baskets containing them, not all products in those baskets. Duplicate product lines count once regardless of quantity. Totals recalculate over qualifying baskets, not averages of store/category averages; this is not global distinct products divided by orders. Return blank with no sales. Do not introduce quantity-based exclusions.

The pre-change DEV model and independent source CSV both have 2,999 sales rows, 2,029 orders and 2,029 composite baskets. No order numbers span different store/date/customer combinations in this sample. There are two repeated basket/product lines and 2,129 lines with quantity above one; blank order/product and nonpositive quantity counts are zero. The robust composite grouping is retained for future order-number reuse. Source-based expected overall average is 2,997 / 2,029 = 1.4770823065549532.

Create the approved one-page `market-basket-analysis.Report`, bound by relative path to `sales.SemanticModel`, with a title and metric-definition subtitle, a summary value, descending horizontal rankings by store and category, and a store/category matrix. Use date, store and category filters in the filter pane with no slicers. Chart selection filters the other data visuals. Label category scope explicitly so category contribution is not confused with whole-basket size. Use Contoso's Cloud canvas, Midnight text, Cornflower accents, Segoe UI and the Fold brand signature.

Implement against the local source of truth, validate locally, deploy through the existing `scripts/deploy.py`, run live data checks in the configured development workspace, and preview the report against that model. Preserve developer-authored scripts.

## Canonical design contract

```yaml
Design Brief:
  generated_by: powerbi-report-cli
  contract_version: 1
  mode: greenfield
  design_identity:
    tone: Contoso quiet confidence
    signature: Two-tone Fold beside lowercase contoso wordmark
  navigation_model: none
  color_map:
    AVERAGE BASKET SIZE: "#536CE5"
    canvas: "#F6F7FB"
    text: "#20283F"
    secondary_text: "#58627A"
    surface: "#FFFFFF"
  typography: Segoe UI; title 24 pt; subtitle/body/axis/matrix 10.5 pt; visual titles 12 pt; summary value 20 pt
  pages:
    - name: Market basket analysis
      role: landing
      archetype: Comparative
      layout_variant: B
      variant_rationale: Two independent ranked dimensions plus a store/category intersection matrix; no invented targets or deltas.
      navigation: []
      layout_contract:
        canvas: {width: 1280, height: 720, margin: 21.33, gutter: 16, snap: 5.33}
        grid:
          columns: 12
          rows: 12
          regions:
            header: [1, 1, 13, 3]
            summary: [1, 3, 4, 5]
            scope: [4, 3, 13, 5]
            stores: [1, 5, 7, 9]
            categories: [7, 5, 13, 9]
            detail: [1, 9, 13, 13]
        placements:
          - {id: page_title, region: header, kind: textbox, x: 21.33, y: 21.33, width: 938.67, height: 48, text: Market basket analysis}
          - {id: subtitle, region: header, kind: textbox, x: 21.33, y: 69.33, width: 938.67, height: 32, text: Average distinct products per basket in the selected category, store and date scope}
          - {id: brand, region: header, kind: image, x: 1056, y: 26.67, width: 192, height: 53.33, purpose: Contoso Fold and wordmark}
          - {id: summary, region: summary, kind: cardVisual, x: 21.33, y: 133.33, width: 293.33, height: 64.67, field_bindings: "Sales[AVERAGE BASKET SIZE]", purpose: Overall average in current scope; 20pt value and 10.5pt label with compact padding; Cornflower from theme palette index 0}
          - {id: scope_note, region: scope, kind: textbox, x: 330.67, y: 122.67, width: 928, height: 90.67, text: Category selections count only selected-category products. Repeated product lines count once. Use the filter pane for Date, Store and Category. Select a bar to filter the other visuals.}
          - {id: stores, region: stores, kind: barChart, x: 21.33, y: 229.33, width: 608, height: 224, field_bindings: "Category: Store[Store]; Y: Sales[AVERAGE BASKET SIZE]", purpose: Rank stores descending by basket size}
          - {id: categories, region: categories, kind: barChart, x: 645.33, y: 229.33, width: 613.33, height: 224, field_bindings: "Category: Product[Category]; Y: Sales[AVERAGE BASKET SIZE]", purpose: Rank category-only basket sizes descending}
          - {id: detail, region: detail, kind: pivotTable, x: 21.33, y: 469.33, width: 1237.33, height: 229.33, field_bindings: "Rows: Store[Store]; Columns: Product[Category]; Values: Sales[AVERAGE BASKET SIZE]", purpose: Compare store/category intersections and recalculated totals}
        space_audit:
          content_cell_count: 120
          placed_cell_count: 120
          empty_cell_pct: 0
          unplaced_regions: []
          largest_region: {name: detail, pct_of_content: 40}
          balance_rationale: Both rankings have equal weight; the matrix owns the full-width lower band. Original placements scale by two thirds, rounded to hundredths, with 16-pixel gutters; fonts retain a legible 10.5pt minimum.
  filters: Page filter pane Calendar[Date], Store[Store], Product[Category]; initially unfiltered; zero slicers
  interactions: Each ranking cross-filters summary, other ranking and matrix; no navigation or bookmarks
  accessibility: Descriptive visual titles and alt text; two-decimal labels; Midnight text on Cloud/white; color is not the sole encoding
```

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md): explicit uppercase measure in Sales, readable description, appropriate format and `Tests.Run` coverage; preserve the star schema and unrelated names.
- Applies: [Report rules](../../.agents/skills/team-practices/references/rules/report-rules.md): Contoso theme and design standards, no more than one slicer and no more than 20 visuals per page. Use accessible contrast, chart alt text and a rendered review.
- Deviations: None. Approval and business-definition decisions are recorded above.

## Acceptance checks
- Basket 318005 (online, 2018-09-15) has two lines for product 1454 with quantities 1 and 5: return 1.00, not 2.00 or 6.00. Basket 309404 (store 560, 2018-06-21) has six distinct products: return 6.00, not its 16 units.
- Store, category, combined store/category and date filters preserve current scope. Basket 309404 has two Computers products among six total: category-only result 2.00. Empty selections return blank.
- Orders 318005 and 324103 at online store 999999 average 3.00; combined with order 309404 at store 560 the total is 4.00, not the unweighted store average 4.50. Independently reconcile store/category/date groups, subtotals and grand total from distinct basket/product combinations divided by composite basket count. Preserve existing behavior for zero/negative quantities if introduced; size is distinct products, not units.
- Add assertions to [Tests.Run](../../src/sales.SemanticModel/definition/functions.tmdl) using existing test patterns. All pre-existing assertions and captured baseline results for `Sales Qty`, `Sales Amount` and `# Sales` remain unchanged. The new measure loads without errors.
- The new report opens with valid bindings, shows both descending rankings and the matrix, exposes the agreed filters, and displays results matching independent model queries. Use a 1280×720 canvas and theme-linked summary accent without changing metric, bindings, filters, sorting or interactions. Review rendered screenshots and cross-filter behavior against the approved definition and Contoso rules.
- Run existing local BPA where supported, deploy with `scripts/deploy.py`, refresh only as required, and run `scripts/test-data.py`. Record passed, failed and unavailable checks separately; do not treat deployment alone as proof of correctness.

## Open questions
None. O1 and O2 resolved by approval comment 6617867994: distinct products per basket, selected-category products only.

## Implementation and validation evidence

- Source: one visible Sales measure with description, lineage and `#,##0.00`; 12 additive `Tests.Run` assertions; separate PBIP/report with one 1280×720 page, eight visuals and zero slicers (originally 1920×1080 at the 2026-11-03 deployment). Existing measures, 36 sales assertions, relationships, source queries and scripts are unchanged.
- Authoring: MCP `ConnectFolder` loaded the source with five tables, 16 measures and four relationships. The new measure was authored/read back as Ready using offline tools. Its exported definition was persisted surgically with `apply_patch`, then the source folder reloaded to validate the measure and expanded `Tests.Run`, avoiding a full-model serialization rewrite.
- Deployment: `AUTH=CLI python scripts/deploy.py` succeeded on the corrected source on 2026-11-03. As designed, the existing script also republished unchanged artifacts. An initial report-resource registration defect was corrected before the successful deployment.
- DEV workspace: `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38`; sales model: `3667483b-67dc-44a2-9056-7d01aa1e4fb9`; market-basket report: `bbcb94aa-3291-40d4-9bd4-54d7b1f2c851`. Report API readback returned PBIR format and the expected sales dataset ID.
- Refresh: `python scripts/refresh.py` completed for both sales and hr.
- Data tests: `python scripts/test-data.py` exited zero. All **48 sales tests** (36 existing + 12 basket tests) and **14 unchanged HR tests** returned boolean `Passed: true`. Exact basket results: repeated product 1, six-product basket 6, combined category/store/date 2, online subtotal 3, weighted total 4, and no-sales/excluded-category blank.
- Regression: after deployment and refresh, Sales Qty remained 9,339; Sales Amount remained 2,739,908.8958; # Sales remained 2,999.
- Independent reference: Python sets over the published source CSVs reconciled all **1,505 store/category/year cube rows**, including every subtotal and grand total, to live DAX with zero missing groups and zero differences above 1e-10. Overall value: **1.4770823065549532**.
- Report structure: author CLI inventory confirms one page, eight visuals, Date/Store/Category page filters and valid local model binding. Both rankings explicitly sort the measure descending; six explicit cross-filter interactions connect the rankings to the other data visuals.
- BPA: not run, as the repository's Windows-only BPA is unsupported in this Linux runner.
- Report schema: final author CLI validation passed with zero errors and warnings.
- Rendering: service preview failed with `RENDER_FAILED: CreateReportFailed`, renderer code `401`, request ID `b7c94736-cf76-4588-b414-fd7d45af09e8`. No verified page screenshot is available. Screenshot review and interactive selection verification remain blocked; a deployed report and passing DAX tests do not establish rendered correctness. Keep this spec In progress until those checks are verified.
- Documentation: updated [sales model](../project/sales.semantic-model.md), [market-basket report](../project/market-basket-analysis.report.md) and [catalog](../project/README.md). Existing unrelated screenshot/documentation gaps were preserved.
- PR-check follow-up, 2026-11-04: failed BPA run `41806938229` identified `ENSURE_THEME_COLOURS` on summary card `abb03600000000000004` and `ENSURE_PAGES_DO_NOT_SCROLL_VERTICALLY` on the 1080px page. Replaced only the card's literal Cornflower with `ThemeDataColor(ColorId=0, Percent=0)`, resolving to the unchanged Contoso `dataColors[0]` (`#536CE5`). Resized the canvas to 1280×720 and all eight rectangles by two thirds; adjusted typography and card padding without changing report logic or model files.
- Follow-up validation: `powerbi-report-author validate src/market-basket-analysis.Report` (CLI 0.5.0) succeeded with **zero errors and zero warnings**, covering schema, bindings, formatting and layout bounds. Initial textbox-height warnings were repaired with explicit zero padding matching the theme. `preview-pages`, `preview-visuals`, `preview-filters` and `preview-themes` confirmed the 720px page, eight in-bounds visuals, three filter cards and unchanged Contoso theme. Manual rectangle inspection found no overlaps; CLI `text measure` estimates fit for the title, subtitle, longest scope paragraph, card label and longest chart title. Segoe UI is unavailable locally, so these approximate measurements do not certify rendered fit.
- Follow-up scope and limitations: read the actual enabled BPA predicates in `scripts/bpa/bpa-rules-report.json`: non-textbox visuals now contain no literal hex colors and the visible page height is 720, not greater than 720. This is rule inspection, not an executed BPA pass; Windows-only BPA was skipped on Linux and CI has not yet rerun on this correction. Retain `#,##0.00`: the whole-number-format warning on `AVERAGE BASKET SIZE` is inapplicable to a fractional average. Unrelated HR/sales warnings, safeguards and workflows are unchanged. `git diff --check` passed and `git diff --exit-code -- src/sales.SemanticModel src/hr.SemanticModel scripts .github` confirmed no changes there. No deployment, data-test rerun or preview retry was performed for this report-only follow-up; previous live-data evidence and the unresolved renderer 401 remain as recorded above.

## Change log
- 2026-11-03: Drafted the code-grounded proposal for issue #36. Recorded metric and category-scope decisions for stakeholder review. No model or report implementation, deployment or live tests performed.
- 2026-11-03: Approval received from @RuiRomano (comment 6617867994). Started implementation, locked distinct-product/category-only semantics and the design contract. Captured pre-change DEV baseline: Sales Qty 9,339; Sales Amount 2,739,908.8958; # Sales 2,999. Profiled basket grain and exact fixtures against DEV and the source CSV; no order-key reuse observed.
- 2026-11-03: Persisted and deployed the measure, 12 additional assertions and separate report. Refreshed both models; all 62 project assertions passed, regression baselines matched, and 1,505 independent reference groups reconciled. Added related project documentation. Local BPA is not applicable on Linux; rendered/screenshot and interaction verification remain outstanding, so delivery is not marked Implemented.
- 2026-11-04: Addressed PR #37 check findings under comment 6633892950: theme-linked summary accent and proportionally resized 1280×720 layout, with readable fonts and compact card padding. Updated the design contract and report documentation; author CLI validation passed with zero diagnostics. Model semantics and tests were untouched. Local BPA and fresh rendering remain unverified; status stays In progress.
