# Margin time-intelligence measures

**Status:** In progress
**Updated:** 2026-11-02

## Goal
Add last-year and year-to-date variants of the existing monetary `Sales[Margin]` measure and make them available in the sales overview report.

## Scope
- Change: Add `Sales[Margin (LY)]` and `Sales[Margin (YTD)]`, assertions in `Tests.Run`, two margin cards on the KPI page, and update related project documentation.
- Keep unchanged: The base Margin definition, existing measures and tests, annual category matrix, data sources, relationships, and report publication state.

## Approach
The Sales table already defines `Margin` and `Sales Amount (LY)`. Add a same-period-last-year margin variant that follows the existing LY measure's current-positive-sales guard, and a calendar-year-to-date margin variant using the Calendar date column. Calendar-year YTD is inferred from the report's existing `Calendar.Year` matrix; the model's fiscal fields are not treated as an approved business calendar. Add the two monetary measures as separate cards above the existing KPI-page matrix. Keep all report changes local.

## Team rules
- Applies: Semantic-model rules for explicit measure naming, placement, formatting, descriptions and `Tests.Run`; report rules for preserving the existing theme and limiting changes to the requested report content.
- Deviations: None.

## Acceptance checks
- `Margin (LY)` matches a direct sales-line margin calculation for the same date period one calendar year earlier, and follows the current-sales guard used by `Sales Amount (LY)`.
- `Margin (YTD)` accumulates sales-line margin from January 1 through the last selected date in the calendar year, retaining non-date filters.
- The KPI page displays both variants as monetary cards; its existing annual category matrix and the existing Sales page remain unchanged.
- Existing `Tests.Run` assertions remain intact, and new assertions cover both variants. TMDL and PBIR validation pass.

## Open questions
None. Calendar-year YTD is an assumption grounded in the existing report's `Calendar.Year` axis; fiscal-year YTD is not requested.

## Change log
- 2026-11-02: Started implementation from issue #30. Selected calendar-year YTD based on the existing KPI matrix and added the variants to the KPI page without changing the existing matrix.
