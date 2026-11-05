# AGENTS.md

## Start here

- Always load `team-practices` skill. Its rules take precedence over conflicting development guidance in other skills, including skills loaded later.
- Unless explicitly asked, always follow the implementation plan in `team-practices` skill: spec > review > implement > test 
- Development should be made against the code in `src/`. 
    - The MCP Server can connect to TMDL folder. After development, you can test the development (e.g. run DAX queries, refresh) against a live Fabric development workspace.    
- Do not create, edit or delete files under `scripts/`. These scripts are developer-authored safeguards for deployment and validation and must not be authored or modified. Agents may run the existing scripts.
- Deploy to the Fabric workspace using running the script `scripts\deploy.py`.     
    - It's ok to overwrite the version in development workspace. Consider the version in `src` the source of truth.
    - Preview the report against the semantic model in workspace.
- GitHub PR instructions:
    - Use [the pull request template](.github/pull_request_template.md) for every PR description, including PRs created by GitHub Copilot cloud agent.
    - Make sure you commit the spec for review in the PR. 
    - Keep the PR description's Open questions section current with unresolved spec questions. Write "None." if there are no open questions.
    - Include a note in the PR calling out the PR originated from AI


## Tool routing

- Use `powerbi-authoring-remote` when authoring against semantic models in Fabric workspaces
- Use `powerbi-authoring-local` when authoring against semantic models in Power BI Desktop or PBIP tmdl folder

## Repository layout

| Path | Contents |
| --- | --- |
| `src/` | PBIP projects: `*.SemanticModel` and `*.Report` folders |
| `docs/specs/` | Development specs, one per feature or refactor |
| `docs/project/` | Generated project documentation |
| `scripts/bpa/bpa.ps1` | Windows-only local Best Practice Analyzer for models and reports. Only covers semantic models and reports. Other Fabric items are not covered. |
| `scripts/deploy.py`, `scripts/refresh.py`, `scripts/test-data.py` | Fabric deployment, refresh and data tests. Only covers semantic models and reports. Other Fabric items are not covered. |
| `.env` | Target Fabric environment. Never print its contents. |

## Code review

- **Honor the spec.** Find the development spec linked in the pull request or matching the affected artifacts in [docs/specs/](docs/specs/). If a spec exists, review the changes against its goal, scope, approach, acceptance checks and approved deviations. Flag missing requirements, behavior that contradicts the spec and out-of-scope changes. Do not invent requirements when no matching spec exists.
- **Ensure the [team-practices](.agents/skills/team-practices/SKILL.md) are applied.** Specially the [semantic model rules](.agents/skills/team-practices/references/rules/semantic-model-rules.md) to semantic model developments and the [report rules](.agents/skills/team-practices/references/rules/report-rules.md) to report developments. 
- Check that tests and validation evidence cover the spec acceptance checks. E.g. new measures should implement `Tests.Run` assertions. 
- **Keep review read-only.** Do not modify files, deploy artifacts or refresh data. Focus findings on issues introduced or worsened by the changes; do not request unrelated cleanup or redesign.
- Ground each finding in the changed code and the specific spec requirement or team rule it violates. Explain the impact and a concrete correction.