# Implement a spec

Build what an approved spec describes (simple asks may not have a spec), within the team rules, and keep the spec in step with what was actually built.

## Checklist

```
- [ ] 1. Review the spec
- [ ] 2. Ensure skills
- [ ] 3. Code it
- [ ] 4. Quality checks
- [ ] 5. Test Data
- [ ] 6. Document
- [ ] 7. Update the spec
```

## 1. Review the spec

Find the spec for the request. If none exists, offer to write one with [spec](./spec.md) first. For a trivial change the developer can waive the spec; record that in the report. If the spec is Draft or has open questions that change the approach, confirm with the developer before building. Set **Status** to In progress.

Record the execution mode, affected artifacts, acceptance checks and existing source changes. Preserve unrelated work.

## 2. Ensure skills

- Load the domain skills for the artifacts in scope.
- Development [rules/](rules/) in this skill there take precedence over conflicting guidance in the domain skills. Reapply them if you load another skill later.

## 3. Code it

- Follow the implementation workflows and this skill development [rules/](rules/).
- Execute the development against the local code in `src/`. Use the available tools against the code not the development environment. E.g. Use Power BI authoring MCP server against the TMDL folder.
- Always ensure changes get persisted to `src/` and don't stay tools memory.
- When developing reports, if Power BI Desktop is not opened or available, preview the report against the semantic model in the development workspace.

## 4. Quality checks

> Only on Windows environment. If not Windows skip this.

- Check every new or changed object against the applicable team rules. Fix deviations you introduced. Report existing ones without changing them.
- Run BPA from the repository root against code in `src/`:

  ```powershell
  & .\scripts\bpa\bpa.ps1 -src @('.\src')
  ```
- Fix failures cause by the implementation, then rerun the affected local checks. Do not suppress rules, weaken assertions or change expected results merely to pass.
- Existing unrelated BPA violations do not block deployment to the development workspace; retain them in the final report.

## 5. Test Data

- Test and validate semantic model changes, deploy it to the development Fabric Workspace configured in `.env`. The authentication is granted by Azure CLI.
- Run the following script to deploy the Power BI artifacts in `src/`

    ```powershell
    python .\scripts\deploy.py
    ```
- Run the script to refresh the semantic models:

    ```powershell
    python .\scripts\refresh.py
    ```
- If deployment is successfull, use the available tools to query the deployed semantic models.
- Run the script for the DAX data asserts:

    ```powershell
    python .\scripts\test-data.py
    ```

    Gather each model name and ID, test name, expected value, actual value and `Passed` result. Only a boolean `true` in `Passed` is a pass. Keep failed rows as evidence.

## 6. Document

- Document the new developments, follow workflow [document](./document.md)
- Do not describe intended behavior as verified behavior. If validation is blocked, record the actual implementation and limitation in the spec; do not mark the delivery complete.

## 7. Update the spec

Set **Status** to Implemented only when every required stage and acceptance check has passed or is genuinely not applicable. Otherwise keep In progress. Bump **Updated** and add a **Change log** entry with what was built, approved divergences, validation evidence, documentation changes and any unresolved findings or blockers. Existing unrelated findings must be distinguished from failures of this change.
