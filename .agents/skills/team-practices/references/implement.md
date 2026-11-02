# Implement a spec

Build what an approved spec describes (simple asks may not have a spec), within the team rules, and keep the spec in step with what was actually built.

Development is done offline against `src/` but there is a development environment to where you can deploy the semantic model and report to test (e.g. test new measures with DAX queries)

## Checklist

```
- [ ] 1. Confirm the spec, mode and target
- [ ] 2. Load skills and rules
- [ ] 3. Build and persist the source
- [ ] 4. Run local checks and repair
- [ ] 5. Test
- [ ] 6. Document
- [ ] 7. Update the spec and report
```

## 1. Confirm the spec, mode and target

Find the spec for the request. If none exists, offer to write one with [spec](./spec.md) first. For a trivial change the developer can waive the spec; record that in the report. If the spec is Draft or has open questions that change the approach, confirm with the developer before building. Set **Status** to In progress.

Record the execution mode, affected artifacts, acceptance checks and existing source changes. Preserve unrelated work.

## 2. Load skills and rules

- Load the domain skills for the artifacts in scope, then read the team development rule files in `./rules`. 
- Load the `team-practices` skill. Rules there take precedence over conflicting guidance in the domain skills. Reapply them if you load another skill later.

## 3. Build and persist the source

- Follow the implementation workflows from the skills
- Execute the development against the local code in `src/`. Whenever applicable use available tools to edit the code. E.g. Use Power BI authoring MCP server against the TMDL folder.
- Persist model and report changes to `src/` before running repository scripts.
- When the work needs to differ from the spec (a better approach, a blocker, a new business rule), stop and agree the change with the developer, then update the spec before building it.
- When developing reports, if Power BI Desktop is not opened, develop against the semantic model in devlopment workspace.

## 4. Run local checks and repair

> Only on Windows environment. If not Windows skip this.

- Check every new or changed object against the applicable team rules. Fix deviations you introduced. Report existing ones without changing them.
- Run BPA from the repository root against every semantic model and report in `src/`:

  ```powershell
  & .\scripts\bpa\bpa.ps1 -src @('.\src')
  ```
- Capture the command, output, status, artifacts analyzed, rule files used, and violations with rule ID, severity and affected object.
- Fix failures caused by this change within the approved spec, then rerun the affected local checks. Do not suppress rules, weaken assertions or change expected results merely to pass.
- Existing unrelated BPA violations do not block deployment to the development workspace; retain them in the final report.

## 5. Test

- The tests are done against a development workspace in fabric, configured in `.env`. The authentication is granted by Azure CLI.
- Deploy to the development Fabric Workspace:

    ```powershell
    python .\scripts\deploy.py
    ```
- Refresh the semantic models:

    ```powershell
    python .\scripts\refresh.py
    ```
- After deployment, use the available tools to run DAX queries to validate developments.
- Run the semantic model data tests:

    ```powershell
    python .\scripts\test-data.py
    ```

    Gather each model name and ID, test name, expected value, actual value and `Passed` result. Only a boolean `true` in `Passed` is a pass. Keep failed rows as evidence.

## 6. Document

- Document the new developments, follow workflow [document](./document.md)
- Do not describe intended behavior as verified behavior. If validation is blocked, record the actual implementation and limitation in the spec; do not mark the delivery complete.

## 7. Update the spec and report

Set **Status** to Implemented only when every required stage and acceptance check has passed or is genuinely not applicable. Otherwise keep In progress. Bump **Updated** and add a **Change log** entry with what was built, approved divergences, validation evidence, documentation changes and any unresolved findings or blockers. Existing unrelated findings must be distinguished from failures of this change.
