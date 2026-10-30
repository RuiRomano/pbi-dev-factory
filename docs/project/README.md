# Power BI Artifact Catalog

## Overview

This project presents Northwind Retail Group sales analysis using sample retail data. One Import semantic model connects sales lines to calendar, product, customer and store dimensions. One report provides an interactive sales summary and a category-by-year financial matrix.

The source queries can randomize sales quantities and net prices at refresh. Treat the results as sample analysis, not certified company revenue. Currency conversion, returns and company fiscal-calendar compliance are not established by the definitions.

## Artifacts

| Artifact | Type | Source | Connected artifact(s) | Purpose | Documentation |
|---|---|---|---|---|---|
| sales | Semantic model | `src/sales.SemanticModel` | sales-overview report | Sales amounts, cost, margin, quantities and entity counts by date, product, customer and store. | [Open](sales.semantic-model.md) |
| sales-overview | Report | `src/sales-overview.Report` | sales semantic model, bound by relative path | Sales overview, trends, product and store comparisons, and annual category KPIs. | [Open](sales-overview.report.md) |

## Project Entry Point and Shared Resources

Open [sales-overview.pbip](../../src/sales-overview.pbip) in Power BI Desktop. Its report definition binds to `../sales.SemanticModel`; no published workspace binding is specified.

The report uses a registered [Contoso theme](../../src/sales-overview.Report/StaticResources/RegisteredResources/Contoso718570950292274.json) over the Fluent2 base theme. The model shares the `HttpSource`, `Environment` and `Randomizer` Power Query parameters across its queries.

The [description specification](../specs/semantic-model-descriptions-202610.md) provides supporting interpretation and caveats. Its linked company-context file is absent from the current worktree, so it was not treated as an available business glossary.

## Run deployed model tests

Install the project requirements and the Fabric CLI, then authenticate with
`fab auth login`. Set `WORKSPACE_NAME` in the root `.env` file and run:

```powershell
python scripts\test-models.py
```

The [test script](../../scripts/test-models.py) finds semantic models under `src`,
reads their display names from `.platform`, resolves their deployed IDs with
`fab get`, and runs `EVALUATE TESTS()` through the Power BI API. It prints the
query results as an aligned table and stops on a CLI or query error. After testing all models, it
raises one error listing every test whose `[Passed]` value is not JSON `true`,
including the model name and test details, and exits with a nonzero status.

The [model-test workflow](../../.github/workflows/test-models.yml) runs manually
from GitHub Actions against the PRD workspace. It uses the PRD environment's
`AZURE_CREDENTIALS` secret to sign in to Azure, authenticates Fabric CLI with
`fab auth login --azure-cli`, and runs the same script. A failed test fails the
workflow.

## Inspection and Validation

Documented on 2026-10-30 from the local model metadata and structured report inspection. Coverage includes five tables, 63 columns, 13 measures, four relationships, one hierarchy, two report pages and nine visuals. No other semantic models, reports or standalone report definitions were found.

Both page screenshots were captured and reviewed. They show the existing Desktop window without a reload from disk. Saved report metadata is authoritative for bindings and calculations; screenshots illustrate the current rendered experience. The KPI heading differs between the window and saved definition. See the [report limitations](sales-overview.report.md#inspection-and-screenshot-limitations).

No model or report definitions were changed, refreshed or deployed. Model load and documentation checks do not establish numerical correctness, source-data uniqueness or deployed access controls.

Documentation validation passed: both artifacts have exactly one document, all 63 columns and 13 measure expressions are covered, both pages have valid PNG screenshots, all 12 relative links resolve, and the relationship diagram parses as Mermaid.
