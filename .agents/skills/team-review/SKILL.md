---
name: team-review
description: "Review Power BI implementations in src or a specific model, report, or item. Use to check team rules, run BPA tests, verify documentation is up to date, and return prioritized findings without changing or saving files."
argument-hint: "Review all of src or name the item to review"
---

# Review an Implementation

Review the implementation against team rules, BPA tests, and documentation.
Return a short, evidence-based review in chat. Do not fix findings or save any
file unless the developer explicitly asks.

Example:

```text
/team-review review src
```

## 1. Understand the scope

Read repository instructions, then inspect `src/`. Review all of `src/` unless
the developer names a specific item. Locate the affected semantic models,
reports, and dependencies. For a scoped review, inspect related objects only
as needed to check the item; do not expand into an unrelated audit.

Use the request and repository context before asking questions. Ask only when
the target or a requirement cannot be resolved from the code.

Keep the review read-only. Do not edit source files, modify connected models,
refresh data, deploy, generate documentation, or save review files. Do not run
commands that write files without explicit permission. If a required check
needs a download, cache, screenshot, or other file output, explain the write
and ask for permission first. If permission is not given, mark the check as
not run and explain why.

## 2. Check the implementation

Load the applicable skills before domain-specific inspection:

- `semantic-model-authoring` for semantic models, DAX, relationships, and data sources.
- `powerbi-report-cli` for report pages, visuals, filters, and model bindings.
- `team-documentation` for documentation requirements and templates.
- `team-rules` after the other skills. Read its applicable rule references.

Use both domain skills when the scope includes models and reports. Team rules
take precedence over conflicting development guidance in other skills. Reapply
them if another skill is loaded later. Use review and inspection workflows,
not authoring or documentation-generation steps.

Use available tools to inspect actual metadata rather than guessing. Discover
the semantic model MCP tools when needed. If a tool or connection is
unavailable, use local files where possible and record what could not be
verified.

Check the in-scope implementation against the applicable team rules. Record
each confirmed deviation with its rule, affected path and object, impact, and
smallest proposed fix. Do not change objects to enforce a rule.

## 3. Run BPA and verify documentation

Read [the BPA script](../../../tests/bpa/bpa.ps1) before running it. It can
download tools and default rules under `tests\bpa\_tools`. Check whether those
files already exist and request permission for any required writes.

From the repository root, run the script with an explicit source path rather
than relying on its defaults:

```powershell
& .\tests\bpa\bpa.ps1 -src @('.\src')
```

For a specific item, replace `.\src` with its containing `.SemanticModel` or
`.Report` folder. For an individual object, BPA still runs on the containing
artifact; distinguish findings on that object from artifact-wide findings.

Inspect the output, not just the exit status. Confirm each intended artifact
was actually analyzed. Missing paths, empty discovery, skipped legacy reports,
missing tools, and interrupted runs are not passes. If one artifact fails and
stops the script, run the remaining in-scope artifacts separately. Report BPA
violations and execution failures separately, without hiding either.

Find existing documentation, normally under `docs/project`, and compare it
with the current implementation using `team-documentation` as the contract.
Check catalog coverage and bindings, one document per artifact, model
structure and calculations, report pages and behavior, screenshots or explicit
capture limitations, relative links, and Mermaid syntax where applicable.
For a scoped review, check the item's document and its catalog entry.

Report missing, stale, inconsistent, or unsupported documentation. Inspect
existing screenshots; do not create or update them without permission. State
any visual checks that could not be verified. Do not regenerate documentation.

## 4. Report the findings

Return the template below in chat. Use one combined list for team-rule, BPA,
and documentation findings. Prioritize by impact:

- **P1:** blocks use, breaks results or bindings, or violates required access controls.
- **P2:** required rule or documentation gap, or a material reliability or usability issue.
- **P3:** lower-impact consistency or clarity issue.

Merge duplicates across checks. Include only evidence-backed findings, use
actual paths and object names, and propose fixes without implementing them.
Keep blocked checks and unknowns explicit rather than inventing findings.
If there are no confirmed findings, say so without implying unrun checks passed.

```markdown
**Scope:** <src or specific item and inspected dependencies>
**Changed:** nothing (read-only), or <explicitly authorized file outputs>

| Check | Result | Evidence |
| --- | --- | --- |
| Team rules | passed / failed / not run / n/a | <rules and objects checked> |
| BPA | passed / failed / not run / n/a | <command, artifacts analyzed, violations or execution errors> |
| Documentation | passed / failed / not run / n/a | <documents compared and gaps> |

## Prioritized findings
| Priority | Check | Location | Finding and impact | Proposed fix |
| --- | --- | --- | --- | --- |
| P1 / P2 / P3 | Team rules / BPA / Documentation | <path, line if available, object> | <evidence and impact> | <smallest fix> |

**Not verified:** <checks not run, partial coverage, and reasons, or "none">
**Assumptions and open questions:** <unresolved details, or "none">
```

Stop after the review. Fixes and saving the review require an explicit
developer request.
