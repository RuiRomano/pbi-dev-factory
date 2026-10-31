# Copilot readiness

**Status:** Draft
**Updated:** 2026-10-31

## Goal
Prepare the `sales` semantic model for Copilot consumption by making its metadata clear and documenting how to select the right fields. Address [issue #13](https://github.com/RuiRomano/pbi-dev-factory/issues/13) without changing calculations or existing report behavior.

## Scope
- Change: Add or refine descriptions on all five tables, 53 visible columns and 15 visible measures in [the model definition](../../src/sales.SemanticModel/definition/). Update [the model documentation](../project/sales.semantic-model.md) with draft AI instructions, recommended AI data schema selections and representative validation questions.
- Keep unchanged: Object names, DAX, `Tests.Run`, Power Query, sources, relationships, types, visibility, summarization, formats, default labels, lineage tags, compatibility level, security, report definitions and existing AI configuration. Do not add measures, rename fields, fix fiscal calculations or write stored Prep data for AI settings.

## Approach
The model already has a star schema, explicit measures, hidden relationship keys and a marked date table. Most visible objects lack descriptions. Use the existing [model documentation](../project/sales.semantic-model.md), source expressions and [returning-customer spec](returning-customers-202610.md) to establish field meaning. Persist description-only edits to the five table files under `src/sales.SemanticModel/definition/tables/`.

Front-load each description with its purpose, grain, unit or distinction from similar fields. Distinguish customer geography from store geography, dimension counts from customers with sales, units from sales-line counts, monetary margin from margin percentage, and filtered new/returning customers from unconditional lifetime classifications. Describe sample data and refresh-generated values honestly. `Sales Amount` is quantity times net price, not verified company net revenue; monetary measures do not convert currencies. `Calendar` filters order dates, not delivery dates. Its fixed 2017–2021 range and July-based fiscal year do not implement the company's February–January fiscal calendar; its current fiscal-quarter expression produces FQ2–FQ5. Document these limitations rather than changing them.

Draft AI instructions and schema recommendations in the model documentation for the owner to apply through Power BI's Prep data for AI experience. Recommend calendar dates for order-date questions, explicit measures for metrics, and exclusion of technical or misleading fields from the AI schema. Preserve Q&A enabled in [definition.pbism](../../src/sales.SemanticModel/definition.pbism). Hidden fields and AI schema exclusions are guidance, not security. Do not claim Copilot readiness is verified until representative questions have been tested in Copilot.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Preserve the star schema and measure placement; use company terminology without asserting unsupported business definitions. No new measures are planned, so no new `Tests.Run` assertions are required.
- Deviations: None planned. Existing names remain unchanged because renaming is outside scope. The developer requested this exact spec filename.

## Acceptance checks
- All five tables, 53 visible columns and 15 visible measures have nonempty, accurate descriptions. Important distinctions and limitations appear near the start, within approximately the first 200 characters.
- The model loads successfully after description edits. The source diff contains only intended descriptions and documentation; all calculations, bindings, tests, settings and existing AI metadata remain unchanged.
- Run the existing local BPA command `& ./scripts/bpa/bpa.ps1 -src @('./src')`. Description warnings on in-scope objects are resolved; record unrelated findings separately.
- In an authorized Fabric development workspace, compare representative existing measure results before and after deployment without changing data between captures. Run `python ./scripts/test-data.py`; all existing 36 `Tests.Run` assertions must return boolean true. Deployment and refresh require separate authorization and must not be performed as part of this spec-only task.
- Provide Copilot questions with expected field routing: “How many units were sold?” uses `Sales[Sales Qty]`; “How many customers bought?” uses `Sales[# Customers (w/ Sales)]`, not `Customer[# Customers]`; “What is margin?” uses monetary `Sales[Margin]`, not a percentage. New and returning customer questions retain the documented filter scope and recalculated totals.
- Provide ambiguous or unsupported questions that require clarification: “Sales by country” distinguishes customer from store country; “Revenue in USD” does not assume currency conversion; “FY25 sales” does not use the sample fiscal fields as the company calendar. Record actual Copilot responses separately from expected behavior.

## Open questions
Currency basis, exchange-rate direction and treatment of returns and discounts are unverified; descriptions must not imply certified net revenue. No business-rule decision is needed for description-only edits. Fabric deployment, refresh and owner-side Copilot configuration/testing remain subject to separate authorization and access.

## Change log
- 2026-10-31: Created a draft for the developer-approved metadata-only scope. Model implementation, deployment and Copilot testing have not started.
