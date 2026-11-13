# Margin LY and YTD

**Status:** Draft
**Updated:** 2026-11-13

## Goal
Add last-year (LY) and year-to-date (YTD) variations of the sales semantic model's margin amount for issue [#54](https://github.com/RuiRomano/pbi-dev-factory/issues/54).

## Scope
- Change: Add two visible measures, `Sales[Margin (LY)]` and `Sales[Margin (YTD)]`, and focused assertions in `Tests.Run` after approval.
- Keep unchanged: Base measures, existing assertions, schema, relationships, data sources, reports and existing object metadata. A combined LY YTD measure is outside scope.

## Approach
The existing `Margin` in [Sales.tmdl](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) sums quantity times net price minus unit cost. It is a currency amount, not a percentage, and applies no exchange-rate conversion. Both variations will reuse this measure, keep its `$ #,##0` format and empty display folder, and include business-friendly descriptions.

Use the existing classic date-column time-intelligence approach on `Calendar[Date]`, which filters `Sales[Order Date]` through the active relationship. LY will evaluate margin over the corresponding dates one year earlier using `SAMEPERIODLASTYEAR`. The existing `Sales Amount (LY)` also requires positive current-period sales; whether margin should inherit a gate remains O2. YTD will evaluate margin from the approved year start through the last selected calendar date, not through today's date. The [Calendar](../../src/sales.SemanticModel/definition/tables/Calendar.tmdl) includes both calendar years and a July-to-June fiscal year, so its YTD boundary requires confirmation in O1.

Extend [functions.tmdl](../../src/sales.SemanticModel/definition/functions.tmdl) with the existing PQL assertions, using explicit date contexts and independent date-range expectations. After approval, validate local model loading and BPA, deploy with the existing deployment script to the configured development workspace, refresh, and execute `Tests.Run` with the existing data-test script. Update the sales model documentation to include the two measures. Do not modify safeguard scripts.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Place measures in `Sales`, preserve naming consistency, add `Tests.Run` coverage and consumer-friendly descriptions.
- Deviations: None planned. Preserve the existing `Margin` casing and parenthesized `(LY)` suffix convention; unrelated naming changes are outside scope.

## Acceptance checks
- For a selected day and month with prior-year data, LY equals the base margin for the corresponding prior-year dates, subject to the approved gate. Verify missing prior-year data, leap-day behavior and current-period zero, negative and blank margins.
- YTD equals base margin over an independently specified range from the approved year start through the selected date. Test a midyear endpoint and both sides of the year boundary, including July 1 if fiscal YTD is chosen.
- Customer, product and store filters remain effective in both variations. Totals evaluate their own date context; YTD totals are not sums of monthly YTD values.
- Test dates without current sales but with earlier sales in the YTD window, and an entirely empty comparison window. Preserve blank versus zero according to the approved definitions.
- Both measures load without errors and retain the specified visibility, format and descriptions. All existing assertions and baseline results for `Margin` and `Sales Amount (LY)` remain unchanged.

## Open questions
O1 - Should YTD start on January 1 or July 1, matching the Calendar's fiscal year?

O2 - Should LY return prior-year margin unconditionally, only when current sales are positive as in `Sales Amount (LY)`, or only when current margin is positive? A positive-margin gate would hide comparisons for current losses and zero margin.

## Change log
- 2026-11-13: Created a code-grounded draft for issue #54. Implementation awaits spec approval and confirmation of the YTD boundary and LY gate.
