# Market basket analysis

## Overview

Compares the number of distinct products per basket across stores and product categories, helping merchandising and store-operations teams investigate product mix. It deliberately does not calculate product affinity, association rules or recommendations.

| Property | Value |
|---|---|
| Source | `src/market-basket-analysis.Report` |
| Entry point | [market-basket-analysis.pbip](../../src/market-basket-analysis.pbip) |
| Semantic model | [sales](sales.semantic-model.md), bound locally to `../sales.SemanticModel` |
| Pages | 1: Market basket analysis |
| Visuals | 8; no slicers |
| Canvas | 1920 × 1080 |
| Theme | Registered Contoso theme; Cloud canvas, Midnight text, Cornflower accents, Segoe UI and two-tone Fold/wordmark |
| Development report | `bbcb94aa-3291-40d4-9bd4-54d7b1f2c851` |
| Development workspace | `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38` |

## Report Flow

The single page moves from a metric definition and summary value to two descending horizontal rankings, then a store/category matrix. Use the filter pane to narrow date, store and category. Select a bar to filter the other data visuals. There are no navigation buttons, bookmarks or drillthrough pages.

## Pages

### Market basket analysis

The saved definition contains a page title, definition subtitle and Contoso Fold/wordmark; one summary card; a category-scope instruction block; store and category bar rankings; and a store-by-category matrix.

**Capture limitation:** no verified live page screenshot is currently available from this Linux implementation session. These descriptions reflect saved metadata, not a claim that the page was visually reviewed. No synthetic screenshot or mock rendering is supplied.

#### Main Metrics

- **AVERAGE BASKET SIZE:** mean of each qualifying basket's distinct ProductKey count. A basket is Order Number + StoreKey + Order Date + CustomerKey. Repeated product lines count once, irrespective of quantity.
- Category scope is **category-only**: count products in the selected categories and baskets containing those products, not all products in those baskets.
- The summary, rankings and matrix all use the same explicit model measure and two-decimal formatting. No report-level business calculation duplicates it.
- Totals recalculate over qualifying baskets, rather than averaging store/category values. No qualifying sales returns blank.

#### Analysis Breakdowns

- **Store ranking:** `Store[Store]`, descending by the basket-size measure; the chart can scroll when all stores do not fit.
- **Category ranking:** `Product[Category]`, descending by category-only basket size.
- **Matrix:** store rows, category columns and the same measure. Row, column and grand totals evaluate in their own filter context.

#### Available Filters

| Scope | Filter or slicer | Behavior / default |
|---|---|---|
| Page filter pane | `Calendar[Date]`, displayed as Date | Advanced date filter; initially unfiltered; filters order date |
| Page filter pane | `Store[Store]` | Categorical; initially unfiltered |
| Page filter pane | `Product[Category]` | Categorical; initially unfiltered; selected-category products only |
| Page | Slicers | None |

#### Interactions and Navigation

Six explicit `DataFilter` interactions configure each ranking to filter the summary, the other ranking and the matrix, rather than highlight the unselected full-basket result. Titles, alt text and the visible instruction block explain the category-only scope and recalculated totals. Interactive behavior still requires live rendered verification.

## Global Filters and Navigation

No report-level filters or navigation are defined. All three filter cards belong to the single page.

## Validation and Capture Limitations

On 2026-11-03, the existing deployment script published the report and semantic model to DEV and the refresh script completed. Power BI report API readback confirmed PBIR format and binding to sales dataset `3667483b-67dc-44a2-9056-7d01aa1e4fb9` in the same workspace. Publishing alone is not proof of rendering.

Author CLI page, visual and filter inventories confirm one page, eight visuals and the three filter cards. Final schema validation passed with zero errors and warnings. Service preview failed with `RENDER_FAILED: CreateReportFailed`, renderer code `401`, request ID `b7c94736-cf76-4588-b414-fd7d45af09e8`. No screenshot was captured. Clipping, typography, scroll behavior, displayed values and click-driven cross-filtering remain unverified. Local BPA was skipped because its analyzer is Windows-only.

All 48 sales data assertions passed, including 12 basket assertions. Independent source CSV calculations matched 1,505 live store/category/year rows and totals. The unfiltered average is **1.4770823065549532**, displayed as **1.48**; basket 318005 returns 1.00 despite two lines and six units; basket 309404 returns 6.00 overall and 2.00 for Computers. These are query results, not observed report screenshots.

See the [implementation spec](../specs/market-basket-analysis-202611.md) for the approved definition, layout contract, exact fixtures and remaining delivery gates.
