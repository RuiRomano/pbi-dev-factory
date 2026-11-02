# Sales currency conversion

**Status:** Draft
**Updated:** 2026-11-02

## Goal
Let analysts select EUR, USD or GBP and see sales amounts in that currency, including costs, margins, prior-year sales and daily or rolling averages. Addresses [issue #22](https://github.com/RuiRomano/pbi-dev-factory/issues/22).

## Scope
- Change: The [sales semantic model](../../src/sales.SemanticModel/definition), with imported exchange rates, a currency calculation group, narrowly scoped amount-measure changes and currency assertions in `Tests.Run`.
- Keep unchanged: Report layouts, HR artifacts, customer and quantity measures, existing measure names and lineage, sales imports and unrelated model objects. Expose a model filter; adding report slicers is not included.

## Approach
The [Sales measures](../../src/sales.SemanticModel/definition/tables/Sales.tmdl) currently aggregate prices without using `Currency Code` or `Exchange Rate`. The source contains USD, EUR, GBP, CAD and AUD sales from 2017-05-18 to 2020-02-29. Existing dollar measure formats and the euro Net Price format do not establish a common base currency. Confirm that Net Price and Unit Cost are denominated in each row's Currency Code before implementing.

Import the supplied [RAW-CurrencyExchange.csv](https://raw.githubusercontent.com/RuiRomano/workshop-fabcon-26-bcn/main/resources/sample-data/RAW-CurrencyExchange.csv) through the existing `HttpSource` parameter. It contains 1,425 rows, unique by Date, FromCurrency and ToCurrency, with five source currencies and EUR, USD and GBP targets. Rates run from 2017-05-31 to 2020-03-03, monthly at month-end through 2019 and daily from 2020-01-01. Direction is source to target: for example, on 2017-05-31, EUR to USD is 1.1221, so EUR 100 becomes USD 112.21.

Prefer a `Currency` calculation group with EUR, USD and GBP items over three copies of every monetary measure. Use dynamic format strings to retain numeric values and show the selected currency. Import a hidden `Exchange Rates` fact table with typed dates, source/target codes and positive numeric rates; validate pair/date uniqueness at refresh. Do not expose rates as additive values or add a direct fact-to-fact relationship with Sales.

Subject to approval, use the order month's month-end rate through 2019 and the exact Order Date rate from 2020 onward. This includes May 2017 orders preceding the first month-end observation. Convert local amounts by multiplying by the matching source-to-target rate, aggregated at rate-date and source-currency grain, then sum into the selected target. Never apply one rate to a mixed-currency total or apply the Sales Exchange Rate again. Missing, duplicate, non-positive or unsupported rates must fail explicitly rather than silently omit sales or use an unrelated date's rate.

Apply conversion to the base `Sales Amount`, `Cost` and `Margin` calculations. Let `Sales Amount (LY)`, `Sales Amount Avg per Day`, `Sales Amount (12M average)` and `Sales Amount (6M average)` evaluate their existing date logic over converted base amounts. Ensure the calculation group reaches these nested base measures exactly once; do not convert the final average or prior-year result using the outer context's rate. All counts and quantities retain their values and formats. No selection or multiple selections preserve existing unconverted values and formats for backward compatibility; those totals remain mixed local currency, not a standardized USD amount.

Extend [functions.tmdl](../../src/sales.SemanticModel/definition/functions.tmdl) with `Tests.Run` assertions for conversion and regression scenarios. Any new helper measures must be hidden, described, named in UPPERCASE, placed in the table they describe and covered by assertions. During implementation, use fixed source-rate fixtures and independent expected calculations against refreshed model rows because the sales import randomizes quantities and net prices.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md): preserve the star schema, hide helper/base numeric columns, keep explicit measures in their subject tables, use consistent names and test new measures through `Tests.Run`. Use Northwind terminology in descriptions without redefining existing sales metrics.
- Deviations: None proposed. Existing mixed-case measure names and unrelated visibility or description issues remain unchanged.

## Acceptance checks
- Selecting each of EUR, USD and GBP converts Sales Amount, Cost and Margin from every source currency, including CAD and AUD. Same-currency rates preserve the local amount. A EUR 100 fixture at the May 2017 rate produces USD 112.21 and GBP 87.37.
- Verify the approved monthly policy for 2017-05-18 and 2019-12-25, and exact daily matching for 2020-01-01 and leap day 2020-02-29. Validate rate coverage for every loaded sales source-currency/date and all three targets.
- Mixed-currency and multi-date totals equal the sum of independently converted components within the declared numeric tolerance. Check customer, product, store and Calendar filters; converted Margin reconciles to converted Sales Amount minus converted Cost.
- Prior-year sales use the prior-year dates' rates. Daily and rolling averages equal the existing averaging definitions evaluated over converted daily amounts, including blank days and the existing rolling-window guards.
- Counts, quantities, customer classifications and their formats remain unchanged for every currency. Empty sales contexts remain blank. No or multiple currency selections preserve all original measure values and formats; single selections use the correct currency symbol and keep values numeric.
- Missing, duplicate, zero or negative rates produce an explicit validation failure, never a partial total. The model loads without errors, retains existing references and passes all pre-existing and new `Tests.Run` assertions, with boolean true in `Passed`.
- During approved implementation, run local BPA on Windows, then deploy, refresh and test in the approved Fabric development workspace if authorized. Record skipped checks and reasons rather than claiming validation.

## Open questions
1. O1: Confirm that Net Price and Unit Cost are local amounts in Sales[Currency Code], rather than amounts already normalized to a common currency.
2. O2: Approve using month-end rates for all orders in that month before 2020, then exact daily rates from 2020. The source does not supply daily rates before 2020.
3. O3: Approve preserving existing mixed-local-currency behavior when no single target is selected, or choose a mandatory/default target currency instead.

## Change log
- 2026-11-02: Inspected the model and both source CSVs. Proposed a calculation-group design, documented rate grain and source-currency ambiguity, and defined conversion and regression checks. Draft only; no model edits, deployment or refresh performed. Awaiting design approval.
