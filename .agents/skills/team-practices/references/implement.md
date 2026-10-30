# Implement a spec

Build what an approved spec describes, within the team rules, and keep the spec in step with what was actually built. In autopilot, own the full delivery: develop, run local BPA, deploy to the test workspace, refresh, test, and document.

**Uses:** the spec in `docs/specs/`; [semantic-model-rules](./rules/semantic-model-rules.md) and [report-rules](./rules/report-rules.md) for the artifacts in scope; the domain skill workflows for the change itself; [test](./test.md) for validation and deployment; [document](./document.md) for project documentation.

## Execution mode

- **Autopilot:** a request to implement in autopilot, autonomously, or end-to-end authorizes the entire checklist, including deploying every artifact in `src/` to the configured test workspace. Do not pause for routine approval between stages or offer required stages as optional next steps.
- **Standard:** build, run local checks, and update the spec. Deploy only when requested. An explicit local-only, no-deploy, or narrower instruction takes precedence over autopilot.
- **Boundaries:** autopilot does not approve a Draft spec, waive business decisions, authorize production deployment, change the target or authentication configuration, or authorize commits and pushes. Ask only for unresolved decisions, permissions or blockers you cannot resolve safely.

## Checklist

```
- [ ] 1. Confirm the spec, mode and target
- [ ] 2. Load skills and rules
- [ ] 3. Build and persist the source
- [ ] 4. Run local checks and repair
- [ ] 5. Test (autopilot or explicitly requested)
- [ ] 6. Document (autopilot or explicitly requested)
- [ ] 7. Update the spec and report
```

Track these stages and their outcomes in the session task list. Continue until all required stages finish or a concrete blocker prevents progress.

## 1. Confirm the spec, mode and target

Find the spec for the request. If none exists, offer to write one with [spec](./spec.md) first. For a trivial change the developer can waive the spec; record that in the report. If the spec is Draft or has open questions that change the approach, confirm with the developer before building. Set **Status** to In progress.

Record the execution mode, affected artifacts, acceptance checks and existing source changes. Preserve unrelated work.

For autopilot, resolve the workspace and environment from the repository deployment configuration without printing `.env` or secrets. Stop before deployment if the target is missing, ambiguous or production, or if unrelated changes make deployment unsafe. Use the authentication checks in [test](./test.md) early to discover setup blockers. Do not silently substitute another workspace.

## 2. Load skills and rules

Load the domain skills for the artifacts in scope, then read the team development rule files in `./references/rules`. Team rules take precedence over conflicting guidance in the domain skills. Reapply them if you load another skill later.

## 3. Build and persist the source

- Follow the domain skill workflows
- Enforce the team rules whenever applicable
- Use the tools against the local code in `src/`, e.g. connect the modeling MCP to the PBIP folder
- New measures need tests in `Tests.Run` as required by the semantic model rules. Don't bloat it a single test per measure might be enough.
- Persist model and report changes to the PBIP/TMDL/PBIR files in `src/` before running repository scripts.
- When the work needs to differ from the spec (a better approach, a blocker, a new business rule), stop and agree the change with the developer, then update the spec before building it.

## 4. Run local checks and repair

- Check every new or changed object against the applicable team rules. Fix deviations you introduced. Report existing ones without changing them.
- Run the local BPA stage in [test](./test.md) and any applicable domain validation, including report bindings and rendered review when reports change.
- Inspect actual findings and artifact coverage, not just command exit codes. Missing tools, skipped artifacts or empty results are not passes.
- Fix failures caused by this change within the approved spec, then rerun the affected local checks. Do not suppress rules, weaken assertions or change expected results merely to pass.
- Resolve change-related local failures before deployment. Existing unrelated BPA violations may continue to the approved test workspace under the test workflow's policy; retain them in the final report.

## 5. Test

- When the development is done, deploy and test in Fabric development workspace. Follow the workflow in [test](./test.md). 
- Testing against Fabric gives you the ability to test the queries, run DAX queries, etc
- After deployment you can connect to the semantic model using the MCP server and run DAX queries. Use the workspace and semantic model name to connect.
- Fix any found issues
- Inspect failures and try a corrective action supported by evidence. Do not repeat unchanged failing commands. If progress needs a business decision, credentials, permissions, a scope change or an unsafe action, record the blocker and stop the dependent stages.

## 6. Document

In autopilot, run [document](./document.md) without a separate request. Update the affected artifact documents, catalog entries and report screenshots in `docs/project/` to match the verified implementation. Preserve unrelated documentation. Record any capture limitation explicitly.

Do not describe intended behavior as verified behavior. If validation is blocked, record the actual implementation and limitation in the spec; do not mark the delivery complete.

## 7. Update the spec and report

Set **Status** to Implemented only when every required stage and acceptance check has passed or is genuinely not applicable. Otherwise keep In progress. Bump **Updated** and add a **Change log** entry with what was built, approved divergences, validation evidence, documentation changes and any unresolved findings or blockers. Existing unrelated findings must be distinguished from failures of this change.

Report once with the template in SKILL.md. Include the execution mode and test target, a **Team rules** row, local BPA, deployment, refresh, data tests, documentation, and a row per acceptance check. Report each as passed, failed, not run or n/a with evidence tied to the final source version. List unverified checks and why. For standard mode, offer only stages not already requested; for autopilot, do not hand back required stages as next steps.
