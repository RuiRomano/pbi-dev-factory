# Power BI CI/CD and agentic development

This sample repository demonstrates a Power BI project including CI/CD and agentic development. It combines version-controlled semantic models and reports, automated validation and deployment, and AI agent skills for developing Power BI projects.

## Repository organization

| Folder / File | Purpose |
| --- | --- |
| [.github/](.github/) | GitHub Actions workflows for CI/CD, pull request validation and Copilot cloud agent setup. They call scripts in `scripts/` |
| [.agents/skills/](.agents/skills/) | Domain skills and project-specific team practices used by AI agents. |
| [src/](src/) | Power BI development uwing PBIP file format. |
| [docs/specs/](docs/specs/) | Development specs describing the goal, scope, approach and acceptance checks for each feature or refactor. |
| [docs/project/](docs/project/) | Documentation for the semantic models and reports. |
| [scripts/](scripts/) | Scripts to deploy, refresh and test artifacts in Fabric. The `bpa/` subfolder provides local Best Practice Analyzer checks. |
| [.vscode/](.vscode/) | Shared VS Code workspace settings. |
| [.mcp.json](.mcp.json) | Declares the MCP servers to load when working with this repository. Alternatively, install the MCP server through the [`powerbi-authoring` plugin](https://learn.microsoft.com/power-bi/developer/agentic/power-bi-agentic-overview#install-the-plugin-with-github-copilot-cli). |
| [AGENTS.md](AGENTS.md) | Provides repository-wide agent guidance. Includes important tool and skill routing to help agents get the job done as we want. |

## Agentic context

Only `team-practices` is maintained by this project. The other skills come from external repositories.

| Skill name | Short description |
| --- | --- |
| [team-practices](.agents/skills/team-practices/) | Project-specific practices for specs, model and report standards, implementation, validation and documentation. This is the skill you can customize or bring your own that defines your workflow and development rules. |
| [semantic-model-authoring](https://github.com/microsoft/skills-for-fabric/tree/main/skills/semantic-model-authoring) | Develop, test and optimize Power BI semantic models and DAX.  |
| [powerbi-report-cli](https://github.com/microsoft/skills-for-fabric/tree/main/skills/powerbi-report-cli) | Plan, author, preview and publish Power BI reports. |
| [fabric-cli-core](https://github.com/microsoft/fabric-cli/tree/main/.ai-assets/skills/fabric-cli-core) | Manage Fabric workspaces and items with the Fabric CLI. |

> [!IMPORTANT]
> - [AGENTS.md](AGENTS.md) is an important agentic context file. Its loaded on every agentic session. It includes important tool and skill routing to help agents get the job done as we want.
> - The external skills are installed locally in `.agents/skills` for convenience, including access by the GitHub Copilot cloud agent and reviewer. Alternatively, you can simply install the [`powerbi-authoring` plugin](https://learn.microsoft.com/power-bi/developer/agentic/power-bi-agentic-overview#install-the-plugin-with-github-copilot-cli). [APM - Agent Package Manager](https://microsoft.github.io/apm/) is another way to manage these skill dependencies.

## Scripts

The Fabric scripts target a development environment configured in a root `.env` file. See [.env.example](.env.example) for the workspace name, environment and authentication settings.

| Script | Description |
| --- | --- |
| [deploy.py](scripts/deploy.py) | Deploys semantic models and reports from `src/` to the configured Fabric workspace using [fabric-cicd](https://github.com/microsoft/fabric-cicd). |
| [refresh.py](scripts/refresh.py) | Refreshes deployed semantic models using the Fabric CLI and waits for completion, reporting failures or timeouts. |
| [test-data.py](scripts/test-data.py) | Runs `Tests.Run()` against deployed semantic models using the Fabric CLI and fails if any assertion does not pass. Assumes each model defines a `Tests.Run()` function that runs assertion tests using [PQL.Assert - DAX Lib](https://daxlib.org/package/PQL.Assert). |
| [bpa.ps1](scripts/bpa/bpa.ps1) | Runs local Best Practice Analyzer checks for semantic models with [Tabular Editor](https://github.com/tabulareditor/tabulareditor) and reports with [FAB Inspector](https://github.com/NatVanG/fab-inspector).| 

### Workflow

Run the scripts in this order. BPA checks local files; deployment, refresh and data tests target the developer's Fabric environment.

```text
Local files in src/
  |
  v
BPA (scripts/bpa/bpa.ps1)
Check local semantic model and report files
  |
  v
Deploy (scripts/deploy.py)
Deploy to the Fabric development workspace using fabric_cicd
  |
  v
Refresh (scripts/refresh.py)
Refresh the deployed semantic models and wait for completion
  |
  v
Test data (scripts/test-data.py)
Run unit tests against the deployed semantic models
```

> [!NOTE]
> The deployment, refresh and test scripts process all project items rather than only changed items. They could be optimized to process only changed items, but this example keeps the design as simple as possible.

## Setup

### Run locally

#### 1. Get the repository

Fork this repository, clone your fork and open PowerShell in the repository root.

#### 2. Install the tools

Install uv, Python 3.14 and the Azure CLI:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv python install 3.14

winget install --exact --id Microsoft.AzureCLI --source winget --silent --disable-interactivity --accept-source-agreements --accept-package-agreements
```

Create a virtual environment using Python 3.14 and install the script dependencies:

```powershell
uv venv --python 3.14 .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r scripts\requirements.txt
```

#### 3. Configure the Fabric workspace

Create a Fabric development workspace manually. Copy [.env.example](.env.example) to `.env` and set `WORKSPACE_NAME` to your workspace name. Keep `ENVIRONMENT=DEV` and `AUTH=CLI` for the steps below.

#### 4. Sign in

Sign in with the Azure CLI, then let the Fabric CLI use that authentication. This matches the authentication approach used by the GitHub workflows.

```powershell
az login
fab auth login --azure-cli
fab auth status
```

Azure CLI authentication is optional. For browser-based authentication instead, set `AUTH=INTERACTIVE` in `.env` for deployment and run `fab auth login` for refresh and data tests.

#### 5. Deploy, refresh and test

Run the scripts in order from the repository root:

```powershell
python .\scripts\deploy.py
python .\scripts\refresh.py
python .\scripts\test-data.py
```

### Run on GitHub.com

The GitHub Actions workflows install their own dependencies. You do not need to complete the local tool installation.

1. Fork the repository and enable GitHub Actions in your fork.
2. Create a Fabric development workspace and update `WORKSPACE_NAME` in [deploy.yml](.github/workflows/deploy.yml) and [test-data.yml](.github/workflows/test-data.yml).
3. In your fork, open **Settings > Secrets and variables > Actions > Repository secrets** and select **New repository secret**. Name it `AZURE_CREDENTIALS` and paste the following JSON, replacing the placeholders with your service principal details:

   ```json
   {
     "clientId": "<application-client-id>",
     "clientSecret": "<client-secret-value>",
     "tenantId": "<directory-tenant-id>"
   }
   ```

    The service principal must have access to the target Fabric workspace and permission to deploy, refresh and query semantic models. 

4. In the **Actions** tab, run **deploy** to deploy and refresh the project. After it succeeds, run **test** to execute the semantic model data tests.

For non-draft pull requests targeting `main` that change files under `src/`, [PR validation](.github/workflows/pr-validation.yml) runs BPA, deployment, refresh and data tests in order.

#### Configure the GitHub Copilot cloud agent

[copilot-setup-steps.yml](.github/workflows/copilot-setup-steps.yml) installs the script dependencies and signs in to Azure and Fabric. Configure the MCP server, agent secrets and environment variables below so the agent can author semantic models and deploy them for testing.

##### 1. Configure the MCP server

In your repository, open **Settings > Copilot > MCP Servers**. Paste and save this configuration:

```json
{
  "mcpServers": {
    "powerbi-authoring-local": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@microsoft/powerbi-modeling-mcp@latest",
        "--start",
        "--accept-eula",
        "--authmode=serviceprincipal"
      ],
      "tools": ["*"],
      "env": {
        "AZURE_CLIENT_ID": "$COPILOT_MCP_AZURE_CLIENT_ID",
        "AZURE_TENANT_ID": "$COPILOT_MCP_AZURE_TENANT_ID",
        "AZURE_CLIENT_SECRET": "$COPILOT_MCP_AZURE_CLIENT_SECRET"
      }
    }
  }
}
```

The `$COPILOT_MCP_...` values reference agent secrets. Do not replace them with credentials in the JSON. See [Configure MCP servers for your repository](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers) for details on MCP secret and variable references.

##### 2. Add agent secrets

Open **Settings > Secrets and variables > Agents > Secrets**. Create a repository secret for each entry:

| Secret | Value |
| --- | --- |
| `AZURE_CREDENTIALS` | The same service principal JSON used for the Actions secret above. Used by the setup workflow to sign in to Azure. |
| `COPILOT_MCP_AZURE_CLIENT_ID` | The service principal's application (client) ID. |
| `COPILOT_MCP_AZURE_CLIENT_SECRET` | The client secret value, not the secret ID. |
| `COPILOT_MCP_AZURE_TENANT_ID` | The directory (tenant) ID. |

Actions and Agents secrets are configured separately. Add `AZURE_CREDENTIALS` in both locations. The `COPILOT_MCP_` secrets are available only to MCP servers.

##### 3. Add agent environment variables

Open **Settings > Secrets and variables > Agents > Variables**. Create these repository variables using the same values as the deployment and test workflows:

| Variable | Value |
| --- | --- |
| `WORKSPACE_NAME` | The name of your Fabric development workspace. |
| `AUTH` | `CLI`, to use the Azure CLI authentication configured by the setup workflow. |
| `ENVIRONMENT` | `DEV`. |

These variables configure the deployment, refresh and test scripts when the agent runs them. Target a development workspace, not a production workspace.

> [!NOTE]
> GitHub's cloud sandbox supports agent secrets but not agent variables. If using that environment, add these three settings as Agents secrets instead. See [Configure secrets and variables for Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/configure-secrets-and-variables).

##### 4. Configure internet access and workflow approval

Open **Settings > Copilot > Internet Access**. Configure the allowlist to permit the package registries, Microsoft authentication endpoints and Fabric APIs needed by the agent, MCP server and scripts. Alternatively, disable the internet access firewall for this example. Prefer an allowlist when working with private code or data.

Open **Settings > Copilot** and disable **Require Approval for workflow runs** so workflows triggered by the agent can run without manual approval. This allows the pull request validation workflow to deploy, refresh and test changes automatically.

> [!NOTE]
> Disabling workflow approval allows agent-triggered workflows to run with their configured secrets and workspace permissions. Use this setting only in a trusted repository targeting a development workspace.

## Make it yours

After completing the setup, replace the sample projects in [src/](src/) with your own Power BI code in PBIP format.

Review the [team-practices skill](.agents/skills/team-practices/) and customize its rules and workflows to match how your team works. For example, use your own naming conventions, define a different testing approach, or change the deployment process to use your existing pipeline. 

Keep [AGENTS.md](AGENTS.md), the [scripts/](scripts/) workflow and the [GitHub Actions workflows](.github/workflows/) aligned with those practices. Changing the skill's guidance does not change the automation, so review both when adapting testing or deployment.

## Resources

- [Power BI Agentic Overview](https://learn.microsoft.com/power-bi/developer/agentic/power-bi-agentic-overview): Overview of agentic development tools and workflows for Power BI.
- [Power BI Desktop projects (PBIP)](https://learn.microsoft.com/power-bi/developer/projects/projects-overview): Store Power BI models and reports as project files for source control.
- [Power BI Project (PBIP) is now generally available - here's how it works](https://www.red-gate.com/simple-talk/data-analytics/powerbi/power-bi-project-pbip-format-guide/): A guide to the PBIP format and how it works.
- [Introduction to CI/CD in Microsoft Fabric](https://learn.microsoft.com/en-us/fabric/cicd/cicd-overview): Overview of source control and deployment workflows in Fabric.
- [Source control for semantic models: deploy it right (part 1)](https://tabulareditor.com/blog/source-control-for-semantic-models): Guidance on semantic model source control.
- [Validate every model change: deploy it right (part 2)](https://tabulareditor.com/blog/validate-every-model-change-with-a-pipeline): Guidance on validating model changes with a pipeline.
- [How to write AI agent skills](https://tabulareditor.com/blog/how-to-write-ai-agent-skills): Guidance on writing skills for AI agents.