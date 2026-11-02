# Sales currency conversion

**Status:** In progress
**Updated:** 2026-11-02

## Goal
Allow analysts to select EUR, USD or GBP and see the sales model's monetary measures in that currency, without changing quantities or customer counts.

## Scope
- Change: The [sales semantic model](../../src/sales.SemanticModel/definition/model.tmdl), adding exchange-rate data, a currency calculation group, conversion logic and focused assertions in [Tests.Run](../../src/sales.SemanticModel/definition/functions.tmdl).
- Keep unchanged: Report layouts, existing object names and lineage, customer classifications, randomization parameters, unrelated models and existing assertions. A report slicer is outside scope; the calculation group column will be available for filters and slicers.

## Approach
The original [Sales measures](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) sum Quantity times Net Price or Unit Cost without conversion. Sales contains USD, EUR, GBP, CAD and AUD source currency codes. The developer confirmed that Net Price and Unit Cost are local-currency amounts. Existing dollar measure formats and the euro Net Price format do not establish currency semantics.

Reuse `HttpSource` to import [RAW-CurrencyExchange.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-CurrencyExchange.csv) into a hidden `Exchange Rates` table. Inspection found 1,425 rows, five source currencies, three target currencies and no duplicate Date/FromCurrency/ToCurrency keys. Every pair has 95 observations: month-end dates from May 2017 through December 2019, followed by daily dates from January 1 through March 3, 2020. Sales starts May 18, 2017, before the first observation. Multiply local amounts by Exchange to convert FromCurrency to ToCurrency; do not also apply Sales[Exchange Rate].

Use a `Currency` calculation group with EUR, USD and GBP items rather than separate currency measures: one selection covers all monetary measures while retaining existing measure names and report bindings. Keep the selector disconnected from Sales. Conversion is limited to the three additive base measures; a seven-measure allowlist controls dynamic formats. Preserve native values and existing formats when no currency or multiple currencies are selected.

Convert additive Sales Amount, Cost and Margin at source-currency and applicable rate-date grain before summing. Never multiply a mixed-currency grand total by one rate. Apply the conversion to the base monetary expressions used by Sales Amount (LY), Sales Amount Avg per Day and the 6M/12M averages so those measures retain their existing date-shift, blank and averaging semantics. Do not iterate an already calculated average or apply current-period rates to last year's sales. Isolate conversion so it is applied exactly once, including nested measure references.

Apply each pre-2020 month-end observation to its entire calendar month, and exact daily rates from January 2020 onward. Keep rate resolution separate from the Calendar filters needed by sales calculations. Reject missing, duplicate, non-positive or unsupported rates for contributing sales rather than silently dropping amounts, substituting 1 or carrying a stale rate forward. Preserve blanks for empty sales contexts. Hide technical rate columns, use no implicit aggregations and leave existing relationships intact.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Preserve the star schema, keep measures in Sales, hide helper columns, use explicit measures with descriptions and formats, and add at least one Tests.Run assertion for every new measure. New measures use uppercase readable names; existing measures are not renamed.
- Deviations: None planned. Hidden exchange rates are lookup inputs, not a separately aggregatable business amount; do not expose a summed exchange-rate measure.

## Acceptance checks
- Validate the currency interpretation and multiplication direction against source sales/product prices and known exchange-rate rows before implementation. For May 2017, 100 USD converts to 89.12 EUR or 77.86 GBP; 100 EUR converts to 112.21 USD. Same-currency rates preserve amounts.
- Test EUR, USD and GBP using sales in all five source currencies. Compare daily, monthly, yearly and grand totals with an independent sum of source amounts times their applicable rates, using the same refreshed randomized Sales values and a stated numeric tolerance.
- Cover May 18, 2017, month boundaries, February 29, 2020, daily rate changes, non-contiguous date selections and product/customer filters. Missing, duplicate, non-positive and unsupported rates must not produce partial totals.
- Test Sales Amount, Cost, Margin, Sales Amount (LY), Sales Amount Avg per Day and both rolling averages. Confirm Margin reconciles to converted Sales Amount minus converted Cost, and shifted/average measures use the correct underlying dates without double conversion.
- Confirm quantities, sales counts and new/returning/customer counts remain unchanged under each currency selection. No selection, multiple selections and empty contexts follow the approved policy; currency formats apply only to monetary measures.
- Preserve and run all existing Tests.Run assertions, adding focused conversion assertions and tests for each new measure. Validate metadata locally; run Windows BPA when available. After deployment authorization, use the existing deploy, refresh and test-data scripts and live DAX queries against the configured development workspace. Record skipped checks rather than claiming success.

## Open questions
None. O1, O2 and O3 were approved in [PR comment 6576191666](https://github.com/RuiRomano/pbi-dev-factory/pull/27#issuecomment-6576191666). Native totals intentionally retain the existing mixed-currency limitation.

## Change log
- 2026-11-02: Inspected the sales definitions, existing assertions and supplied exchange-rate data. Proposed a calculation group and documented currency and date-policy decisions for review. No model changes, deployment or refresh performed.
- 2026-11-02: Developer approved O1, O2 and O3 and requested implementation. Started offline tool-mode authoring against the source TMDL. Conversion in the three additive base measures preserves the existing date-shift and averaging definitions; calculation items retain the selected expression and provide currency-specific formats.
