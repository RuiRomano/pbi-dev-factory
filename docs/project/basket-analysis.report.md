# Basket analysis

## Overview

Compares average product units per order across stores and product categories for merchandising and store operations. This is basket-size analysis, not product-pair affinity, confidence or lift. Built from the [reviewed demo spec](../specs/basket-analysis-202611.md).

| Property | Value |
|---|---|
| Source | [`src/basket-analysis.Report`](../../src/basket-analysis.Report) |
| Entry point | [basket-analysis.pbip](../../src/basket-analysis.pbip) |
| Semantic model | [sales](sales.semantic-model.md), bound locally to `../sales.SemanticModel` |
| Pages | 1 |
| Visuals | 6: two bar charts, one matrix and three textboxes |
| Theme | Team Contoso palette and Segoe UI on a Cloud canvas |
| Canvas | 1280 by 720, FitToPage; chart colours reference Contoso palette index 0 |

## Report Flow

The single page, **Where are baskets larger?**, places store and category rankings above a store/category detail matrix. Bars are sorted by average units per basket descending. All stores remain available through scrolling. Hovering a bar shows its distinct basket count, so high averages can be considered alongside order volume. Expand a store in the matrix to see its categories.

## Pages

### Where are baskets larger?

Screenshot unavailable: service preview failed with `RENDER_FAILED: CreateReportFailed`, code `401`, request `d890a171-0d3b-46c6-968a-870f0016f343`. The descriptions below reflect saved PBIR metadata, not verified rendering.

#### Main Metrics

- **Units per basket:** `Sales[AVERAGE BASKET SIZE]`, displayed to two decimal places. Selected units divided by distinct nonblank orders. Not distinct-product count or monetary basket value.
- **Baskets:** `Sales[BASKETS]`, distinct nonblank order numbers, shown in tooltips and the matrix.
- **Units:** Existing `Sales[Sales Qty]`, shown in the matrix for volume context. The source currently contains no blank-order lines.

Category results count only units in that category and orders containing that category. They do not show whole-order contents. Orders can belong to several categories; totals recalculate from selected units and distinct orders rather than summing basket counts or averaging category averages.

#### Analysis Breakdowns

Store and product category rankings share the same basket-size measure and Cornflower color. The matrix groups stores and categories and shows basket size, baskets and units. It is not limited to top-ranked stores.

#### Available Filters

| Scope | Field | Behavior / default |
|---|---|---|
| Page filter pane | Calendar.Date | Order-date context; no saved restriction. |
| Page filter pane | Store.Country | Country selection; all by default. |
| Page filter pane | Store.Store | Store selection; all by default. |
| Page filter pane | Product.Category | Category selection affects both units and eligible orders. |
| Page filter pane | Product.Brand | Brand selection affects both units and eligible orders. |

#### Interactions and Navigation

There are no slicers, bookmarks, custom buttons or drillthrough pages. Standard Power BI chart selections and matrix expand/collapse controls are available in the definition. Interactive behavior, keyboard navigation and filter-pane rendering have not been verified.

## Validation and Limitations

Report-authoring CLI 0.5.0 validation passed with zero errors and warnings. The local model loaded with 17 measures and four unchanged relationships. `scripts/deploy.py` published the final source to `RR - PBI Factory {dev}`, and the published report binding was read back:

- Workspace: `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38`
- Report: `da9fcaeb-ad27-4640-b3c2-a7d954ba2121`
- Sales semantic model: `3667483b-67dc-44a2-9056-7d01aa1e4fb9`

Both deployed models refreshed successfully. `scripts/test-data.py` passed all 48 Sales assertions, including 12 basket checks, and 14 HR assertions. An independent per-order calculation matched 395 store/category rows including the total. The current data has 2,029 baskets, 9,339 units and an average of 4.60 units per basket.

Windows-only BPA was not run on Linux. Service preview failed with the `401` above, so no page screenshot was captured. Rendering, label clipping, scrolling, filtering and accessibility remain unverified. The spec stays In progress until a fresh preview and interaction review pass.

PR validation initially failed the chart theme-colour rule and warned about the 1080px canvas height. Both bar charts now reference the Contoso theme instead of hard-coded colours, and the canvas and layout fit 1280 by 720. The corrected report passed CLI validation with zero errors and warnings; its data queries are unchanged. Full CI rerun results are recorded in the spec.
