# BPA remediation

**Status:** In progress
**Updated:** 2026-11-05

## Goal
Resolve all findings from the repository's existing BPA rules without changing metric definitions or report bindings.

## Scope
- Change: The local definitions of [hr.SemanticModel](../../src/hr.SemanticModel/definition/) and [sales.SemanticModel](../../src/sales.SemanticModel/definition/), plus their directly related [project documentation](../project/).
- Keep unchanged: Report definitions, measure names and DAX definitions, relationships, security, source locations, lineage tags and existing tests. Preserve the developer's current sales DAX query and TMDL script edits. Do not edit anything under [scripts](../../scripts/), including the rules.

## Approach
The existing [BPA script](../../scripts/bpa/bpa.ps1) ran against all five artifacts. Tabular Editor found 48 HR violations and 74 sales violations, including informational findings. Explicit verbose report runs against each report's `definition` folder confirmed boolean `Pass: true` for all 51 results: customer-comparison 11, HR 23 and sales-overview 17. Exit code alone is not the acceptance signal.

Add the 93 missing descriptions, grounded in existing expressions and source transformations: 21 HR columns, plus five sales tables, 14 sales measures and 53 sales columns. Disable MDX attribute hierarchies for the flagged hidden columns that remain.

In HR, change `Headcount[FTE Value]` from floating point to fixed decimal, including its Power Query output type. Generated weights are 0.8 and 1.0, which fit four decimal places. Remove the unused hidden `Calendar[Fiscal Month]` column and its Power Query step after confirming no references. Convert the exposed `Employee[Manager Flag]` values from Boolean to text `Yes` and `No`, preserving the underlying manager classification and column name. Mark the Employee, Department and Location dimension keys as primary keys. Categorize Location City and Country appropriately.

Use the exact accepted percentage format `#,0.0%;-#,0.0%;#,0.0%` for the two attrition measures. Use the accepted `#,0.0` format for FTE, average headcount and salary cost. This preserves fractional FTE and average headcount; salary cost displays one decimal instead of two, without intentionally rounding its calculated value. These format and type changes are intentional and require approval.

Open and save local definitions with the local semantic-model authoring tools. Compare complete before/after model metadata to verify that only approved properties and source expressions change. Review affected HR pages locally where Desktop preview is available. Update model documentation and the overlapping HR spec's change log without rewriting its business scope. The developer subsequently selected local-only changes, so do not deploy, refresh or test in Fabric.

## Team rules
- Applies: [Semantic model rules](../../.agents/skills/team-practices/references/rules/semantic-model-rules.md), especially business-friendly descriptions and preserving existing naming when redesign is out of scope. [Report rules](../../.agents/skills/team-practices/references/rules/report-rules.md) apply to regression review, not restyling. No new measures are planned.
- Deviations: None. Do not suppress findings or relax rules.

## Acceptance checks
- Both semantic model folders load successfully, and BPA reports zero violations of any severity. Confirm actual analyzer output, not merely exit status.
- All 51 report BPA results still return boolean true. Report definitions and bindings remain unchanged.
- All 24 existing measure expressions, both `Tests.Run` definitions, relationships, roles, lineage tags and unrelated metadata remain unchanged. Live data regression is outside the approved local-only delivery; do not claim new runtime test results.
- The manager source expression maps true to `Yes` and false to `No`. Removed Fiscal Month has no remaining references or generating source step. Primary key metadata changes do not alter source key values. Data-level checks require a processed local model.
- Freshly loaded HR pages render without errors and preserve fractional FTE, attrition percentages, filtering and snapshot behavior. Record any intentionally changed salary display precision.
- Changes persist locally. Record deployment, refresh, test and rendered-review results explicitly, including checks not run.

## Open questions
None. The developer approved the proposed changes and then explicitly selected local-only delivery on 2026-11-05.

## Change log
- 2026-11-05: Drafted from the completed BPA baseline: 122 model findings and 51 passing report results. Source fixes have not started.
- 2026-11-05: Developer approved implementation, including the manager flag type change, Fiscal Month removal and salary display precision change. Using offline authoring tools against both local definitions. The deployment script has no item selector and republishes all source models and reports, including unchanged reports.
- 2026-11-05: Saved all fixes through offline authoring tools and reloaded both folders successfully. The required BPA command reported no model violations; all 51 report results returned boolean true. Full before/after metadata comparisons confirmed exactly 93 added descriptions and 24 unchanged measure expressions, with only approved metadata and source changes.
- 2026-11-05: Deployment script stopped before publishing because WORKSPACE_NAME was not configured. Developer selected local-only delivery. No workspace was changed and no Fabric refresh or data tests were run. Local HR rendered review remains pending.
