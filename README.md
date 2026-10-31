# Power BI CI/CD and agentic development

This sample repository demonstrates Power BI continuous integration and delivery (CI/CD) and agentic development. It combines version-controlled semantic models and reports, automated validation and deployment, and AI agent skills for developing Power BI projects.

## Repository organization

| Folder | Purpose |
| --- | --- |
| [src/](src/) | Power BI project source, organized into semantic model (`.SemanticModel`) and report (`.Report`) folders. Make model and report changes here. |
| [docs/specs/](docs/specs/) | Development specs describing the goal, scope, approach and acceptance checks for each feature or refactor. |
| [docs/project/](docs/project/) | Generated documentation for the semantic models and reports. |
| [scripts/](scripts/) | Scripts to deploy, refresh and test artifacts in Fabric. The `bpa/` subfolder provides local Best Practice Analyzer checks. |
| [.github/](.github/) | GitHub Actions workflows for CI/CD, pull request validation and Copilot cloud agent setup. |
| [.agents/skills/](.agents/skills/) | Domain skills and project-specific team practices used by AI agents. |
| [.vscode/](.vscode/) | Shared VS Code workspace settings. |

[AGENTS.md](AGENTS.md) provides repository-wide agent guidance. Development happens in the local source; refresh and data tests run against a live Fabric development workspace.

## Run locally

The [scripts/](scripts/) scripts target a Fabric development environment configured in a root `.env` file. See [.env.example](.env.example) for the workspace name, environment and authentication settings. Deployment uses [fabric_cicd](https://github.com/microsoft/fabric-cicd) to publish semantic models and reports from [src/](src/).

Set up a Python virtual environment and install [scripts/requirements.txt](scripts/requirements.txt). Run these commands in PowerShell from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r scripts\requirements.txt
```

If you do not already have a `.env` file, copy [.env.example](.env.example) to `.env`. Set `WORKSPACE_NAME` to your Fabric development workspace and use `ENVIRONMENT=DEV`. Keep credentials out of source control.

The example uses `AUTH=CLI`, which requires Azure CLI and an authenticated session. Sign in with an account that can deploy to the target workspace, then deploy:

```powershell
az login
python scripts\deploy.py
```

Alternatively, use `AUTH=INTERACTIVE` for browser sign-in or `AUTH=SPN` with the Azure service principal environment variables. After deployment, run refresh and data tests:

```powershell
python scripts\refresh.py
python scripts\test-data.py
```

## Agent skills

The [semantic-model-authoring](.agents/skills/semantic-model-authoring/) and [powerbi-report-cli](.agents/skills/powerbi-report-cli/) skills come from [skills-for-fabric](https://github.com/microsoft/skills-for-fabric). They support semantic model development and report authoring. The [fabric-cli-core](.agents/skills/fabric-cli-core/) skill comes from [fabric-cli](https://github.com/microsoft/fabric-cli) and provides guidance for Fabric CLI operations.

These skills are copied into the repository for convenient use by the GitHub Copilot cloud agent. For local use, they can instead be installed in your user profile through their respective plugin installation workflows.

The [team-practices](.agents/skills/team-practices/) skill is an example of a team skill personalized to this project. It adds team instructions for specifications, model and report standards, implementation, validation and documentation on top of the domain skills.
