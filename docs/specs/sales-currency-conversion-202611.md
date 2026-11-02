# Sales currency conversion

**Status:** Draft
**Updated:** 2026-11-02

## Goal
Allow analysts to select EUR, USD or GBP and see sales monetary measures in that currency. Resolve [issue #22](https://github.com/RuiRomano/pbi-dev-factory/issues/22) without converting customer counts or quantities.

## Scope
- Change: The sales model in `src/sales.SemanticModel`, currency conversion assertions in `Tests.Run`, and related model documentation after implementation.
- Keep unchanged: Report layouts, HR artifacts, existing measure names, customer classification, sales randomization, unrelated relationships and existing test assertions. Model users can filter the new calculation group without report edits.

## Approach
The existing [Sales measures](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) calculate amounts without using `Currency Code` or `Exchange Rate`. Their dollar display formats do not establish the currency of the underlying prices. The order-line grain and active Order Date relationship to Calendar support date-aware conversion once the price basis and rate-date policy are confirmed.

Prefer a `Currency` calculation group with EUR, USD and GBP items over three copies of every monetary measure. Import the supplied [RAW-CurrencyExchange.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-CurrencyExchange.csv) as a hidden `Currency Exchanges` table through the existing HTTP source pattern. Its 1,425 rows cover five source currencies (AUD, CAD, EUR, GBP and USD), three target currencies and 95 dates per pair, with no duplicate date/source/target keys. Dates are month-end from May 2017 through December 2019, then daily from January 1 through March 3, 2020. Reciprocal pairs are consistent with multiplying a source amount by `Exchange` to obtain the target amount, subject to source rounding.

Apply conversion only to `Sales Amount`, `Cost` and `Margin` and ensure their dependent measures (`Sales Amount (LY)`, `Sales Amount Avg per Day`, `Sales Amount (12M average)` and `Sales Amount (6M average)`) evaluate converted amounts within their own date contexts, exactly once. Preserve average denominators and prior-year date shifts rather than applying one rate to an already aggregated result. Aggregate additive amounts at the confirmed source-currency/rate-date grain before conversion, then sum converted contributions. Keep unrelated measures and their formats unchanged. Use dynamic format strings for €, $ and £ so results stay numeric.

Proposed selection behavior is to preserve existing results and formats when no currency or multiple currencies are selected; only a single selected item converts. Missing, duplicate, non-positive or unsupported required rates must not yield partial totals or silently use a rate of one. Proposed behavior is blank for the whole affected monetary result, with rate-quality assertions identifying the failure. No-sales results remain blank. Finalize these policies and the price basis before implementation; do not infer them from display symbols or use the existing sales exchange rate twice.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Preserve the star schema, keep new helper columns hidden, keep any new measures in the tables they describe, use uppercase names for new measures, and add an assertion in `Tests.Run` for each new measure plus coverage for calculation items.
- Deviations: None planned. Existing mixed-case measure names remain unchanged. Review this draft before changing model definitions; implement offline against the PBIP definition folder using local modeling tools.

## Acceptance checks
- Validate refresh types, unique date/source/target keys, positive rates and coverage for every required sales currency and effective date. Check a known pair: on 2017-05-31, 100 EUR converts to 112.21 USD and 87.37 GBP. Same-currency rates return the original amount.
- Independently calculate order-line results using the approved price basis and date policy. Compare all three target currencies for single dates, month/year totals, mixed source currencies, non-contiguous dates and grand totals. Never multiply a mixed-currency total by a single rate.
- Verify `Cost`, `Margin`, prior-year sales and all three sales averages against independently converted contributions. Confirm Margin reconciles to converted sales less converted cost within a justified rounding tolerance, and derived measures are not double-converted.
- Verify customer counts, quantity, existing customer classification and non-monetary formats are unchanged under each currency filter. Verify approved no-selection, multi-selection, missing-rate and no-sales behavior, including a context where only one contributing rate is missing.
- Extend [Tests.Run](../../src/sales.SemanticModel/definition/functions.tmdl) without changing existing assertions. Capture same-refresh baselines because quantities and prices are randomized at refresh. Run local BPA where Windows is available. If DEV deployment is approved, deploy, refresh and run `scripts/test-data.py`; every assertion must return boolean true in `Passed`. Check numeric results and dynamic formats on a live model, not just metadata saves.

## Open questions
O1 - Are `Net Price` and `Unit Cost` expressed in each row's `Currency Code`, or already normalized to a common currency? If normalized, which currency? How was the existing `Sales[Exchange Rate]` applied upstream?

O2 - Which rate-date policy should apply before 2020: the rate recorded at that month's end, or the latest rate on or before Order Date? The latter has no rate before 2017-05-31. Should dates outside coverage remain blank rather than carrying rates beyond their intended period?

O3 - Approve preserving legacy results for no/multiple currency selection and returning blank for an entire result with an invalid required rate, or specify different behavior.

O4 - After spec approval, should implementation include deployment, refresh and live validation in the configured Fabric development workspace?

## Change log
- 2026-11-02: Created a draft from the sales definitions and supplied rate file. Recommended a calculation group and recorded blocking price-basis and rate-date decisions. No model changes, deployment or refresh performed.
