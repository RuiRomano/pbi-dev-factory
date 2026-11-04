# HR and Sales conversational AI readiness

**Status:** Draft
**Updated:** 2026-11-04

## Goal
Prepare `hr` and `sales` for reliable conversational answers through Fabric IQ, Copilot and Fabric data agents. Review requested in [issue #42](https://github.com/RuiRomano/pbi-dev-factory/issues/42). Neither model is certified AI-ready by this assessment.

## Scope
- Change: This PR records the assessment and proposed changes for approval. Model metadata work and user-configured AI preparation follow only after approval.
- Keep unchanged: `src/`, DAX definitions, names, relationships, sources, security, reports and `scripts/`. No deployment or refresh during this review.

## Approach
Both local definitions loaded successfully through the offline modeling tool on 2026-11-04: HR has six tables, nine measures and eight relationships; Sales has five tables, 15 measures and four relationships. Both use Import, star-shaped relationships, marked calendars, hidden fact keys and `discourageImplicitMeasures`. Loading proves metadata parsing, not refresh, data quality, DAX correctness or conversational accuracy.

Apply the following priorities in order. **Agent-editable** means proposed source changes after approval; **user-configured** means supported Power BI or Fabric settings, not hand-authored internal AI metadata.

| Priority / owner | Evidence and recommendation |
| --- | --- |
| P0 / business owners | Resolve fiscal and currency ambiguity before publishing defaults. [Sales Calendar](../../src/sales.SemanticModel/definition/tables/Calendar.tmdl#L179) starts fiscal years in July; [HR Calendar](../../src/hr.SemanticModel/definition/tables/Calendar.tmdl#L1) uses February through January. Sales fiscal-quarter arithmetic also needs boundary validation. Do not silently align calendars or describe them as equivalent. [Sales Amount](../../src/sales.SemanticModel/definition/tables/Sales.tmdl#L14), `Cost` and `Margin` do not reference the visible `Currency Code` or `Exchange Rate`; dollar formats do not prove a common reporting currency or net treatment of returns. Confirm source semantics before calling the amount “revenue” or allowing mixed-currency totals. |
| P0 / model and access owners | Retain HR's synthetic-demo status prominently. [HR's existing spec](hr-demo-202610.md#L49) leaves policy definitions unconfirmed. No roles are declared in either local definition; service permissions and memberships were not inspected. Approve the audience and test least-privilege consumer access before exposure. Exclude customer address, birthday and employee-level detail from the initial AI scope unless needed. Hiding fields, AI schemas and instructions are not security; approve RLS/OLS separately before introducing restricted real data. |
| P1 / agent-editable | Add business descriptions to Sales' five tables, 14 undescribed measures and 53 visible columns; only `# Returning Customers` currently has a measure description. Describe Sales' order-line grain, units and exclusions. Distinguish `# Sales` (rows, not distinct orders), `# Customers` (dimension population) and `# Customers (w/ Sales)` (buyers in context). Explain that the 6M/12M average measures average daily amounts within their windows, not monthly totals. Front-load critical distinctions within the first 200 characters. |
| P1 / agent-editable | Preserve HR's six table and nine measure descriptions; describe its 21 visible columns, which currently have none. Prioritize [Employee](../../src/hr.SemanticModel/definition/tables/Employee.tmdl#L12), calendar fields and [movement attributes](../../src/hr.SemanticModel/definition/tables/Movements.tmdl#L109). Distinguish employee hire/termination attributes from event dates; exit reason and tenure band describe exits, not the current workforce. Clarify that snapshot totals are not sums across months and salary cost is a monthly synthetic illustration, not annual payroll. |
| P1 / user-configured | In **Prep data for AI**, define a focused schema per model. HR: approved Headcount/Movements measures with Calendar, Department and Location; include Employee grouping fields only when approved. Sales: approved amount, quantity, cost, margin and customer measures with Calendar, Product, Store and approved Customer geography. Distinguish store geography from customer geography. Leave technical fields such as `Sales[Environment]`, `Time`, line identifiers and unrelated detail out of conversational scope. Review measure dependencies so required objects remain available without exposing raw aggregation columns as preferred metrics. Match the data agent's selected tables to this schema. |
| P1 / user-configured | Put metric definitions, date basis, supported history and approved terminology in each model's **AI instructions**. HR: use existing `HEADCOUNT`, `FTE`, `AVERAGE HEADCOUNT` and trailing-12-complete-month `ATTRITION RATE`; do not recalculate attrition as exits divided by closing headcount. Sales: use Calendar through the active order-date relationship; delivery-date analysis is not implemented. Preserve [new/returning customer semantics](returning-customers-202610.md#L14), including filter dependence and totals. Ask for clarification when “sales”, “customers”, “turnover” or “last year” is ambiguous. Do not map all exits to resignations. |
| P2 / user-configured | Configure verified answers from reviewed existing report visuals for closing headcount, attrition trend and Sales amount by product/store. Use several full-question paraphrases per answer and inspect its fields and filters. Data agents use verified-answer metadata to guide DAX, not to return the Power BI visual itself. At agent level, route workforce questions to HR and retail questions to Sales; clarify ambiguous requests and do not invent employee-to-sales joins. Model-specific DAX guidance belongs in Prep data for AI, not agent instructions. |

Use the supported UI to inspect existing AI configuration before changing it; its absence from these local files does not establish its absence in the service. Preserve existing settings and [Q&A enabled in both models](../../src/hr.SemanticModel/definition.pbism#L5). Current Microsoft guidance requires Q&A for advanced DAX instance-value indexing and announces a replacement setting after Q&A retires in December 2026; do not invest in legacy Q&A phrasings. Verify tenant, capacity, region, permissions and the chosen Fabric IQ/data-agent runtime in the target environment.

The assessment follows Microsoft's [Copilot model guidance](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-evaluate-data) and [semantic-model guidance for data agents](https://learn.microsoft.com/en-us/fabric/data-science/semantic-model-best-practices), checked on 2026-11-04. Preview behavior and platform support must be rechecked during implementation.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md). Preserve the star schema, explicit measures, hidden aggregation-only columns and measures in their subject tables. No naming sweep; use UPPERCASE for any separately approved new measure and add a `Tests.Run` assertion. Use company context for descriptions, but do not override conflicting source definitions.
- Deviations: None. No new measures, security redesign or report changes are proposed in this metadata-first pass.

## Acceptance checks
- After approval, capture a baseline, apply only approved metadata changes, reload both definitions and review the diff. Existing DAX, relationships, lineage, report bindings and AI configuration must remain intact. New descriptions must cover every visible table, column and measure with units, grain and important exclusions.
- Run existing Windows BPA, then the existing deployment, refresh and `test-data.py` scripts against DEV after implementation. Every `Tests.Run()` result must have boolean `Passed = true`; compare existing measure results and BLANK behavior to baseline. These checks were not run for this documentation-only assessment.
- Evaluate the following prompts and at least two paraphrases each in the actual Copilot/Fabric IQ surface. Record selected model, generated DAX, date/filter context, expected result from an independent DAX query, actual result and latency. All cases must match before release; a plausible narrative alone is not a pass. Numeric expectations below are historical fixtures from existing project documentation, not results rerun in this review.

| Prompt | Expected field and behavior |
| --- | --- |
| “How many employees did we have at December 2025 month end, by department?” | HR `[HEADCOUNT]`, Calendar Date = 2025-12-31, Department grouping. [Documented total](../project/hr.semantic-model.md#L50): 891. Revalidate independently; never count all Employee rows or sum snapshots. |
| “What was average headcount during 2025?” | HR `[AVERAGE HEADCOUNT]` over selected months, not the closing snapshot or sum. Compare with independently calculated monthly headcounts. |
| “What was attrition at June 2023 month end? And December 2025?” | HR `[ATTRITION RATE]`: June 2023 is blank for insufficient history, not zero. December 2025 has a documented approximately 5.02% fixture; verify the trailing window and denominator independently. |
| “What was salary cost for 2025?” | Clarify monthly closing cost versus annual expense. Existing `[SALARY COST]` is monthly synthetic cost at the latest selected snapshot, not annual payroll. Say the data is fictional. |
| “Show 2019 sales and units by store country.” | Sales `[Sales Amount]` and `[Sales Qty]` through Calendar order dates and `Store[Country]`, not Customer country. State the approved currency basis; do not infer it from `$`. |
| “How many orders and customers did we have in 2019?” | Distinct orders need a separately approved measure or clarification; `[# Sales]` is line count. Use `[# Customers (w/ Sales)]` for buyers, not the Customer population count. |
| “Show new and returning customers by month and at the total.” | Sales' existing customer measures. New plus returning equals customers with sales in each context; totals recalculate, not sum months. Retain the approved brand/category filter scope and blank-versus-zero behavior. |
| “Show FY25 performance” / “Show last month's workforce” / “Compare sales per employee.” | Clarify model, metric and fiscal basis; state when the requested period lies outside data coverage. Sales Calendar covers 2017–2021, HR snapshots 2023–2025. Do not substitute the latest historical period for “last month” or join the unrelated models. |

- Test authorized, restricted and unmapped consumers in the chosen surface, not only workspace administrators. Confirm schema exclusions cannot substitute for permissions and no unauthorized detail is returned. Live security and service configuration remain unverified in this review.

## Open questions
- O1 - Which Fabric IQ/Copilot entry point and runtime will be used, who will consume it, and which questions are highest priority? Confirm tenant/capacity eligibility and existing Prep data for AI configuration.
- O2 - Which fiscal definitions should each model use? Is Sales' July start intentional, and should fiscal-quarter logic be corrected in a separately approved change?
- O3 - What are Sales' reporting currency, exchange-rate direction and treatment of returns/discounts? Which measure should “revenue” select?
- O4 - Confirm HR remains a synthetic demo and approve its snapshot, attrition and salary definitions, allowed detail, date defaults and access policy before wider use.

## Change log
- 2026-11-04: AI-originated review for issue #42. Inspected local metadata and existing specs, loaded both definitions offline and checked current Microsoft guidance. Draft only; no source changes, deployment, refresh or live conversational tests. Ready for developer review.
