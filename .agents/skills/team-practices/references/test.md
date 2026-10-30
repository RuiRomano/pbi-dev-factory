# Test the project

Run the local BPA checks, deploy to Fabric, refresh, and run the semantic model data tests. Return a short, evidence-based report so the developer can decide what to fix. Do not fix findings or save a report unless the developer asks.

**When called by implement:** return stage results and evidence to [implement](./implement.md), which owns the repair loop, spec updates and final report. Its autopilot authorization covers project-wide deployment only to the verified test target. Do not stop for a separate request between authorized stages. The read-only and stop-after-report restrictions here apply to standalone testing, not to the parent implementation workflow.

**Uses:** the team rules, to classify BPA findings that are also team-rule deviations; the spec's acceptance checks, when testing a specific development.

## Checklist

```
- [ ] 1. Check authentication
- [ ] 2. Understand the scope
- [ ] 3. Run BPA locally
- [ ] 4. Deploy to Fabric
- [ ] 5. Refresh the models
- [ ] 6. Run the data tests
- [ ] 7. Report the findings
```

Run every command from the repository root. Inspect the output, not just the exit status, at every step.

## 1. Check authentication

Deployment uses Azure CLI. Check it first:

```powershell
az account show
```

Confirm the intended account and tenant. If `az` is missing, not logged in, or on the wrong tenant, stop and report the blocker. Ask the developer to install Azure CLI or run `az login` for the right tenant, then check again. Confirm the deployment configuration uses `AUTH=CLI`.

Then sign Fabric CLI in with the same account:

```powershell
fab auth login --azure-cli
```

## 2. Understand the scope

Read repository instructions and inspect `src/`. List the semantic models and reports to test. Record existing source changes without reverting them.

The scripts always work on every model and report in `src/`. They don't filter by item. If the developer asks for one item, explain the project-wide scope. Do not edit the scripts to narrow it.

The root `.env` sets the target Fabric environment (`WORKSPACE_NAME`, `ENVIRONMENT`, `AUTH`). Never print secrets, tokens or the contents of `.env`. Use the configured Python environment and install from `scripts/requirements.txt` only when needed and authorized. Never ask for credentials in chat.

When testing a specific development, read its spec in `docs/specs/` and map its acceptance checks to the stages below.

## 3. Run BPA locally

```powershell
& .\scripts\bpa\bpa.ps1 -src @('.\src')
```

The script can download tools and default rules to `scripts\bpa\_tools` on first run. Capture the command, output, status, artifacts analyzed, rule files used, and violations with rule ID, severity and affected object.

Missing paths, empty discovery, skipped legacy reports, missing tools and interrupted runs are not passes. If one artifact stops the script, run the rest separately by passing their `.SemanticModel` or `.Report` folders in `-src`, and keep the original failure in the report. Separate rule violations from tool failures and list artifacts that were not analyzed.

## 4. Deploy to Fabric

```powershell
python .\scripts\deploy.py
```

Record the workspace, environment, authentication mode, status, published items, warnings and errors, without credentials. Reconcile published items with what is in `src/`. An empty or partial deployment is not a pass.

BPA violations don't block deployment to the approved test workspace. Continue when authorized and keep the BPA findings. If deployment fails or can't be confirmed complete, mark the data tests as not run for this source version. Never present results from an older or partial deployment as validation of the current code.

## 5. Refresh the models

```powershell
python .\scripts\refresh.py
```

If a model fails to refresh, stop. The data tests depend on fresh data.

## 6. Run the data tests

```powershell
python .\scripts\test-data.py
```

Gather each model name and ID, test name, expected value, actual value and `Passed` result. Only a boolean `true` in `Passed` is a pass. Keep failed rows as evidence.

Confirm every expected model was tested and returned rows with the required columns. Zero models, zero rows, malformed results, missing `TESTS()` support, authentication errors, query errors and timeouts are not passes. Separate assertion failures from execution failures.

If the script stops at a model error, report the remaining models as not verified. In standalone testing, do not change the script, DAX, expected values or deployed data to make tests pass. When called by implement, return the failure for an in-scope repair; never weaken assertions or manipulate deployed data to obtain a pass.

## 7. Report the findings

Merge duplicate findings across stages and prioritize by impact:

- **P1:** deployment blocker, incorrect data results, broken bindings, or access-control failure.
- **P2:** required rule violation, incomplete test coverage, or material reliability issue.
- **P3:** lower-impact consistency or clarity issue.

Include only evidence-backed findings, with real paths, objects, rule IDs, test rows and error messages. Propose the smallest fix without implementing it. Separate confirmed defects from setup blockers and unknowns. If nothing was found, say so without implying unrun checks passed.

Use the report template in SKILL.md with these rows and the findings table below:

```markdown
**Target:** <workspace, environment, authentication mode>

| Check | Result | Evidence |
| --- | --- | --- |
| Azure CLI authentication | passed / failed / not run | <account and tenant check, without credentials> |
| Fabric CLI authentication | passed / failed / not run | <result or setup blocker> |
| Local BPA | passed / failed / not run | <artifacts analyzed, violations or execution errors> |
| Fabric deployment | passed / failed / not run | <target, items published, warnings or errors> |
| Refresh | passed / failed / not run | <models refreshed or errors> |
| Data tests | passed / failed / not run | <models covered, passed and failed counts, or execution errors> |
| Spec acceptance checks | passed / failed / not run / n/a | <checks mapped to results> |

## Prioritized findings
| Priority | Check | Location | Finding and impact | Proposed fix |
| --- | --- | --- | --- | --- |
| P1 / P2 / P3 | BPA / Deployment / Refresh / Data tests / Team rules | <path, object, rule ID or test name> | <evidence and impact> | <smallest fix> |
```

For standalone testing, add the outcome to the spec's change log only when the developer asks. Stop after the report. Fixes, configuration changes and saving the report need an explicit request. When called by implement, return the evidence to that workflow and continue its checklist instead.
