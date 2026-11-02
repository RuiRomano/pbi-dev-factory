# General guidance

## Important

- Always load `team-practices` skill. Its rules take precedence over conflicting development guidance in other skills, including skills loaded later.
- Unless explicitly asked, always follow the implementation plan in `team-practices` skill: spec > review > implement > test 
- Development should be made against the code in `src/`. After development, you can test (run DAX queries, refresh) against a live Fabric development workspace by running `scripts\deploy.py`.
- For new developments in GitHub, make sure you commit the spec for review in the PR.

## Tool routing

- Use `powerbi-authoring-remote` when authoring against semantic models in Fabric workspaces
- Use `powerbi-authoring-local` when authoring against semantic models in Power BI Desktop or PBIP tmdl folder

## Repository layout

| Path | Contents |
| --- | --- |
| `src/` | PBIP projects: `*.SemanticModel` and `*.Report` folders |
| `docs/specs/` | Development specs, one per feature or refactor |
| `docs/project/` | Generated project documentation |
| `scripts/bpa/bpa.ps1` | Windows-only local Best Practice Analyzer for models and reports |
| `scripts/deploy.py`, `scripts/refresh.py`, `scripts/test-data.py` | Fabric deployment, refresh and data tests |
| `.env` | Target Fabric environment. Never print its contents. |

## Code review

- Find the development spec linked in the pull request or matching the affected artifacts in [docs/specs/](docs/specs/). If a spec exists, review the changes against its goal, scope, approach, acceptance checks and approved deviations. Flag missing requirements, behavior that contradicts the spec and out-of-scope changes. Do not invent requirements when no matching spec exists.
- Read [team-practices](.agents/skills/team-practices/SKILL.md) and its applicable rule files before reviewing Power BI changes. Read the files directly if skill loading is unavailable.
- Apply the [semantic model rules](.agents/skills/team-practices/references/rules/semantic-model-rules.md) to model changes and the [report rules](.agents/skills/team-practices/references/rules/report-rules.md) to report changes. Team rules take precedence over conflicting guidance in other skills. Respect explicitly approved deviations.
- Check that tests and validation evidence cover the spec's acceptance checks and the applicable team rules, including `Tests.Run` assertions for new measures. 
- Keep review read-only. Do not modify files, deploy artifacts or refresh data. Focus findings on issues introduced or worsened by the changes; do not request unrelated cleanup or redesign.
- Ground each finding in the changed code and the specific spec requirement or team rule it violates. Explain the impact and a concrete correction. Distinguish missing validation evidence from a confirmed implementation defect.
