---
name: team-practices
description: "Apply this repository's Power BI team practices: write and maintain specs, follow team rules, implement changes with local BPA, deploy to the Fabric development environment, test and query live semantic models, and document the project. Team rules take precedence over conflicting guidance in other skills."
argument-hint: "Describe what you want to spec, implement, document or test"
---

# Team Practices

**Deliver Power BI work the way this team does it**: start from a reviewed spec, build within the team rules, prove the result with the project tests, and keep the documentation current. This skill adds team process and rules on top of the domain skills. It does not replace them.

## Start here

1. **Understand the request.** What the developer wants, which models or reports in `src/` are affected, and whether a spec already exists in `docs/specs/`. Reuse what the developer already said.
2. **Load the domain skills** the task needs: `semantic-model-authoring` for models, DAX, relationships and data sources; `powerbi-report-cli` for Power BI report pages, visuals, filters and bindings. Load both when the work spans models and reports.
3. **Load the team rules.** Read the [team rule files](#team-rules) for the artifacts in scope. They are required for spec and implementation work, and they apply to reviews, documentation and testing too.
4. **Pick the workflow** below, load its file, and follow its checklist.
5. **Report back** with the template in [Definition of done](#definition-of-done).

## Workflow selector

| Developer wants to... | Workflow |
| --- | --- |
| Start a new development or refactor, or update an existing spec | [spec](./references/spec.md) |
| Build what an approved spec describes | [implement](./references/implement.md) |
| Generate or refresh project documentation | [document](./references/document.md) |

Workflows are step-by-step procedures in `references/`. Follow their checklist. They chain: spec, then implement, then test, then document. Each one can also run on its own.

## Team rules

The rule files in `references/rules/` are the repository's authority for development decisions.

| File | Covers |
| --- | --- |
| [semantic-model-rules](./references/rules/semantic-model-rules.md) | Star schema, explicit measures, measure placement, naming consistency, table naming |
| [report-rules](./references/rules/report-rules.md) | Design standards, Contoso theme, color, typography, layout, brand signature, rendered review |
| [contoso-theme.json](./references/rules/contoso-theme.json) | Power BI theme baseline for new reports |
| [contoso-design-standards.png](./references/rules/contoso-design-standards.png) | Brand reference image for new reports |
| [company-context.md](./references/rules/company-context.md) | Use this as general background when building reports, writing descriptions, or documenting any data model at Northwind Retail Group. Not for external distribution. |

## Working principles

- **The spec is the contract.** Implementation follows an approved spec. When the work needs to diverge, update the spec and get agreement before building the divergence.
- **Discover before asking.** Inspect `src/`, the model metadata and the report definitions yourself. Ask only for business decisions and details you can't retrieve.
- **Never invent business definitions.** Sources, join keys, security rules and metric definitions come from the developer or the data. Record unknowns as open questions.
- **Smallest complete change.** Change only what the request needs. Match the existing conventions of the model or report.
- **Evidence over claims.** A successful save, deploy or script run is not proof. Report each check as passed, failed, not run or not applicable, with evidence.
- **Stay in your lane.** Standalone spec and review workflows don't change `src/`. For new development start with spec and wait for developer approval. During implementation its ok to deploy to development environment using the repo `scripts/`.

## Definition of done

End every task with this report. Each workflow says what to add.

```markdown
**Workflow:** <spec / implement / document>
**Changed:** <files or objects and what changed, or "nothing (read-only)">
**Spec:** <link to the spec and its status, or "none">

| Check | Result | Evidence |
| --- | --- | --- |
| Team rules | passed / failed / not run / n/a | <rules and objects checked> |
| <workflow check> | ... | ... |

**Not verified:** <checks not run and why, or "none">
**Assumptions and open questions:** <list, or "none">
```
