# Copilot readiness for sales and HR

**Status:** Approved
**Updated:** 2026-11-02

## Goal
Improve Copilot's interpretation of the existing sales and HR semantic models using accurate model metadata, without changing established calculations or inventing business policy.

## Scope
- Change: Add concise, business-readable descriptions to visible tables, columns and measures in both models. Add geographic data categories where the field meaning is explicit. Document safe Prep data for AI recommendations and representative questions.
- Keep unchanged: Measure expressions, names, relationships, date logic, hidden fields, sources, security, reports and existing Prep data for AI settings.

## Approach
Use the model definitions, existing project documentation and approved demo spec as the source for every description. For sales, distinguish customer geography from store geography; `Calendar[Date]` filters `Sales[Order Date]`, while `Delivery Date` is not related. Describe sales amount as quantity times net price and flag that currency consolidation is not defined. For HR, preserve the documented synthetic-data caveat, month-end snapshot semantics, trailing-12-complete-month attrition definition and February-to-January fiscal calendar.

Power BI's Prep data for AI instructions, data schema and verified answers are user-configured, not represented in these TMDL files. Do not write or replace those settings. Add draft, evidence-based recommendations and test prompts to the model documentation for the owner to apply and verify. Keep Q&A enabled because the AI preparation workflow depends on it.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md), [modeling standards](../../.agents/skills/semantic-model-authoring/references/kb/modeling-standards.md), and [Copilot readiness workflow](../../.agents/skills/semantic-model-authoring/references/optimize-for-ai.md). Descriptions must be grounded in known business meaning and front-load disambiguation; hidden fields and relationships remain unchanged.
- Deviations: None.

## Acceptance checks
- Both TMDL folders load after changes; every visible table, column and measure has an accurate description, and explicitly geographic fields have appropriate data categories.
- No measure expression, object name, relationship, hidden flag, source, report, test assertion or Q&A setting changes.
- Preserve the existing `Tests.Run` functions and assertions. Compare model objects before and after to confirm descriptions and approved geographic categories are the only metadata changes.
- Document representative Copilot questions with the expected measure, grouping and date basis. Clearly identify unresolved sales currency and customer-versus-store geography choices instead of encoding guesses as instructions.

## Open questions
None. The user authorized best-judgment changes following recommended AI-readiness practices. Workspace Prep data for AI settings and live Copilot answers are not available in the local TMDL project and will remain unmodified and unverified.

## Change log
- 2026-11-02: Approved scope based on the user's direction to use best judgment. Keep model behavior fixed; improve metadata and provide owner-applied AI setup recommendations grounded in repository evidence.
