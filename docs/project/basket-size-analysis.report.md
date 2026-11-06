# Basket size analysis

## Overview

Store operations and merchandising can compare stores and product categories by units per basket, rather than total sales volume or spending.

| Property | Value |
|---|---|
| Source | [basket-size-analysis.Report](../../src/basket-size-analysis.Report) |
| Entry point | [basket-size-analysis.pbip](../../src/basket-size-analysis.pbip) |
| Semantic model | [sales](sales.semantic-model.md), bound by `../sales.SemanticModel` |
| Pages | 1: Basket analysis |
| Design | Team Contoso theme, Segoe UI, Cloud canvas and Cornflower data marks |

## Report flow

Read the definition and summary first, compare the descending store and category rankings, then inspect the store/category matrix. The six visuals include two textboxes, one two-value summary card, two bar charts and one matrix. The store chart can scroll to additional stores. Hover over bars for basket count, so a large average based on few baskets is not mistaken for high volume.

### Main metrics

- **Units per basket:** Units on identified orders divided by distinct nonblank order numbers. Multiline orders count once. No qualifying orders returns blank.
- **Baskets:** Distinct identified orders in the current selection.
- **Units:** Existing `Sales Qty`, shown in the matrix for volume context. This existing measure includes all selected lines; the basket metrics exclude lines with blank order numbers.

A category view includes only that category's units and orders containing that category. It does not show the full size of baskets containing the category. An order containing several categories can appear in several category rows, so basket counts are not additive across categories. Totals recalculate the ratio from selected units and orders; they do not sum or average the displayed averages.

## Filters and interactions

| Scope | Field | Default |
|---|---|---|
| Page filter pane | Calendar.Date | All dates |
| Page filter pane | Store.Country | All countries |
| Page filter pane | Store.Store | All stores |
| Page filter pane | Product.Category | All categories |

There are no slicers, bookmarks, drillthrough pages or report navigation controls. The matrix has store and category row levels with expand/collapse controls. Chart selection uses standard Power BI interactions. Interactive filtering and rendering must be verified separately from DAX results.

## Validation and limitations

The [implementation spec](../specs/market-basket-analysis-202611.md) records validation evidence. The local model loads with the two added measures. Deployment and refresh passed using the repository scripts. All 49 deployed sales assertions passed, including 13 basket assertions and all 36 existing assertions; all 14 HR assertions also passed. Existing sales measures matched their pre-change baseline before refresh. Independent code review found no significant issues. JSON, visual bounds, non-overlap and theme-color checks passed. Final report CLI validation and screenshot review remain pending.

Open the [deployed development report](https://app.powerbi.com/groups/0a6ed388-8f6e-40a0-a9ac-df7d1522ba38/reports/a3f23b3f-9cda-49e7-bb88-7a1ec21191ca). The deployment script also republished existing source artifacts and the refresh script refreshed both models. Source definitions for those unrelated artifacts were not changed.

Screenshot capture is not yet verified. No screenshot is included until the latest saved report has been rendered and reviewed. Source quantities can change at refresh, so this is sample analysis, not certified business performance. No causal claim or product-affinity analysis is made.
