# Sales currency conversion

**Status:** Draft
**Updated:** 2026-11-02

## Goal
Let analysts select EUR, USD or GBP and have sales monetary measures use that currency, with numeric results and matching currency symbols. Addresses issue #22. This proposal and PR originated from AI.

## Scope
- Change: Currency selection, exchange-rate import, conversion logic and assertions in the sales semantic model, followed by updates to its existing project documentation after implementation.
- Keep unchanged: Report definitions, customer classification, quantities, counts, unrelated models, existing object names and lineage tags. No deployment or refresh during spec review.

## Approach
The [sales model](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) has seven monetary measures: `Sales Amount`, `Sales Amount (LY)`, `Sales Amount Avg per Day`, `Sales Amount (12M average)`, `Sales Amount (6M average)`, `Cost` and `Margin`. Prices, `Currency Code` and `Exchange Rate` are imported, but the monetary measures ignore both currency fields. Measures use dollar formats while `Net Price` uses a euro format, so formatting alone does not establish the stored amounts' currency. There is no existing calculation group.

Prefer a `Currency` calculation group with EUR, USD and GBP items over three copies of every monetary measure. Its column can be used as a filter or slicer without changing existing report bindings. Apply conversion only to the seven monetary measures, using explicit measure identification rather than name or format matching. Preserve counts and quantities and their formats. New monetary measures will need explicit inclusion and tests.

Import the supplied [exchange-rate CSV](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-CurrencyExchange.csv) as hidden `Exchange Rates` data. The inspected file has 1,425 unique date/from/to rows, covering AUD, CAD, EUR, GBP and USD from 2017-05-31 through 2020-03-03. Rates are monthly at month end through 2019, then daily from 2020-01-01. The direction is target units per source unit, for example USD to EUR is 0.8912 on 2017-05-31. Retain all source currencies needed by sales, not just the three output currencies. Verify key uniqueness and positive rates at refresh.

Resolve O1 and O2 before choosing the conversion grain and date lookup. Convert additive amounts at the applicable sales date and source-currency grain, then aggregate. Compute prior-year sales using prior-year rates, and daily and rolling averages from converted amounts with their existing date windows and blank behavior. Do not multiply an already aggregated total or average by a single rate. Preserve `Margin = Sales Amount - Cost` in the selected currency. Keep results numeric and use calculation-item format strings for €, $ and £.

Propose leaving all existing values and formats unchanged when no currency is selected. Require a single selected currency; return blank for monetary results under an explicit multiple selection rather than silently choose one. For a selected currency, propose failing visibly if any contributing amount lacks a unique valid rate, rather than returning a partial total, carrying a stale rate or inventing a rate. These policies require approval under O3.

Extend [Tests.Run](../../src/sales.SemanticModel/definition/functions.tmdl) using the existing PQL assertions. After approval, validate the saved TMDL and local BPA, then run engine checks and the existing [data test script](../../scripts/test-data.py) only against an authorized development target.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Preserve the star schema and existing names, use plural naming for the exchange-rate fact, hide numeric rate inputs, keep any new explicit measures in their subject table, and add at least one `Tests.Run` assertion for each new measure. Apply Northwind terminology to new descriptions.
- Deviations: None proposed. Existing mixed-case measure names and formatting inconsistencies are context, not a request for unrelated cleanup.

## Acceptance checks
- EUR, USD and GBP selections convert all seven monetary measures and apply the matching numeric format. Identity conversions preserve the underlying amount.
- Independently calculate a known sale and a mixed-date, mixed-source-currency total using the approved price and rate-date definitions. Results match within an agreed numeric tolerance; missing and duplicate rates cannot produce partial totals.
- Prior-year sales use the rates for the prior-year sales dates. Daily and rolling averages match independent averages of converted amounts, including non-contiguous date filters and no-sales periods.
- Converted margin equals converted sales less converted cost. Product, customer and date filters still constrain the contributing sales.
- Quantities and customer and transaction counts remain unchanged for every selection. No selection reproduces existing monetary results and formats; explicit multiple selection follows the approved policy.
- All existing `Tests.Run` assertions still pass. New assertions cover each currency, totals, time-dependent measures, blank behavior, selection behavior and rate quality. Metadata loads without errors and local BPA introduces no change-related violations.

## Open questions
- O1: Are `Net Price` and `Unit Cost` stored in each row's `Currency Code`, or already normalized to a common currency? If normalized, which currency? What direction and purpose does the existing row-level `Exchange Rate` have?
- O2: Should each pre-2020 month-end rate apply to every sale in that month, with exact daily matching from 2020 onward? What should happen outside the supplied coverage? No forward fill, extrapolation or use of future rates will be assumed.
- O3: Approve the proposed unchanged no-selection behavior, blank monetary results for explicit multiple selection, and visible failure for missing, duplicate or invalid required rates.

## Change log
- 2026-11-02: Inspected the sales definitions, existing tests and supplied rates. Proposed calculation-group conversion and recorded unresolved price, date and selection policies for review. No model changes implemented.
