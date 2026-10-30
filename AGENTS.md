# General guidance

## Repository layout

| Path | Contents |
| --- | --- |
| `src/` | PBIP projects: `*.SemanticModel` and `*.Report` folders |
| `docs/specs/` | Development specs, one per feature or refactor |
| `docs/project/` | Generated project documentation |
| `scripts/bpa/bpa.ps1` | Local Best Practice Analyzer for models and reports |
| `scripts/deploy.py`, `scripts/refresh.py`, `scripts/test-data.py` | Fabric deployment, refresh and data tests |
| `.env` | Target Fabric environment. Never print its contents. |

## Important

- For all Power BI tasks, load `team-practices` skill after the applicable domain skills. Its rules take precedence over conflicting development guidance in other skills, including skills loaded later. 

## Tool routing

- Use `powerbi-authoring-remote` when authoring against semantic models in Fabric workspaces
- Use `powerbi-authoring-local` when authoring against semantic models in Power BI Desktop or PBIP tmdl folder

## Scripts

The scripts use Azure CLI for authentication and Fabric CLI to deploy and run queries.

Check if the Azure CLI is logged in:

```powershell
az account show
```

And ensure the Fabric CLI is authenticated with same account:

```powershell
fab auth login --azure-cli
```

- Use `./scripts/deploy.py` to deploy the `src/` to Fabric Workspace
- Use `./scripts/refresh.py` to refresh the semantic models
- Use `./scripts/test-data.py` to run semantic model data tests, to detect regressions
