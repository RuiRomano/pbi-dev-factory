# Power BI Artifact Catalog

## Overview

This project presents Northwind Retail Group sales analysis using sample retail data and a separate, fictional HR demo semantic model and local report. The sales Import model connects sales lines to calendar, product, customer and store dimensions. The sales-overview report provides an interactive sales summary and a category-by-year financial matrix. The customer-comparison report compares new and existing customers by month. All three HR pages have Desktop screenshots; agreement with the latest saved definitions and interactive behavior remain unverified.

The source queries can randomize sales quantities and net prices at refresh. Treat the results as sample analysis, not certified company revenue. Currency conversion, returns and company fiscal-calendar compliance are not established by the definitions.

## Artifacts

| Artifact | Type | Source | Connected artifact(s) | Purpose | Documentation |
|---|---|---|---|---|---|
| sales | Semantic model | `src/sales.SemanticModel` | sales-overview and customer-comparison reports | Sales amounts, cost, margin, quantities, new and returning customers, and entity counts by date, product, customer and store. | [Open](sales.semantic-model.md) |
| hr | Semantic model | `src/hr.SemanticModel` | hr report | Synthetic employee snapshots and movements for headcount, FTE, salary cost and attrition demonstrations. | [Open](hr.semantic-model.md) |
| hr | Report | `src/hr.Report` | hr semantic model, bound by relative path | Three-page fictional HR demo: workforce trends, exits and workforce mix. Local only; current Desktop screenshots documented. | [Open](hr.report.md) |
| sales-overview | Report | `src/sales-overview.Report` | sales semantic model, bound by relative path | Sales overview, trends, product and store comparisons, and annual category KPIs. | [Open](sales-overview.report.md) |
| customer-comparison | Report | `src/customer-comparison.Report` | sales semantic model, bound by relative path | Monthly comparison and detail for new, existing and total customers with sales. | [Source](../../src/customer-comparison.Report/definition/pages/2b3f5f9676144f1e9f79/page.json) |

## Project Entry Point and Shared Resources

Open [sales-overview.pbip](../../src/sales-overview.pbip) in Power BI Desktop. Its report definition binds to `../sales.SemanticModel`; no published workspace binding is specified.

Open [customer-comparison.pbip](../../src/customer-comparison.pbip) for the separate, single-page customer report. It uses the same local model and the [Contoso theme](../../src/customer-comparison.Report/StaticResources/RegisteredResources/Contoso.json). The chart groups by `Calendar[Year-Month]`, sorted ascending, and compares `Sales[# New Customers]` with `Sales[# Returning Customers]`, displayed as existing customers. The matrix also shows `Sales[# Customers (w/ Sales)]`. Date, category and brand filters are available in the filter pane; there are no slicers.

Existing customers are customers with sales who are not new in the same period. The report inherits the model's filter-dependent classification, not an unconditional lifetime definition. A customer who makes first and later purchases in a period counts only as new. Totals recalculate in the selected period and are not sums of monthly counts. The existing report and semantic model are unchanged.

The report uses a registered [Contoso theme](../../src/sales-overview.Report/StaticResources/RegisteredResources/Contoso718570950292274.json) over the Fluent2 base theme. The model shares the `HttpSource`, `Environment` and `Randomizer` Power Query parameters across its queries.

The [description specification](../specs/semantic-model-descriptions-202610.md) provides supporting interpretation and caveats. Its linked company-context file is absent from the current worktree, so it was not treated as an available business glossary.

## Run deployed model tests

Install the project requirements and the Fabric CLI, then authenticate with `fab auth login --azure-cli` using an existing Azure CLI session. Set `WORKSPACE_NAME` in the root `.env` file and run:

```powershell
python scripts\test-data.py
```

The [test data script](../../scripts/test-data.py) finds semantic models under `src`, reads their display names from `.platform`, resolves their deployed IDs with `fab get`, and runs `EVALUATE Tests.Run()` through the Power BI API. It prints the query results as an aligned table and stops on a CLI or query error. After testing all models, it raises one error listing every test whose `[Passed]` value is not JSON `true`, including the model name and test details, and exits with a nonzero status.

The [test data workflow](../../.github/workflows/test-data.yml) runs manually from GitHub Actions or through the [PR validation workflow](../../.github/workflows/pr-validation.yml) against the DEV workspace. It uses the DEV environment's `AZURE_CREDENTIALS` secret to sign in to Azure, authenticates Fabric CLI with `fab auth login --azure-cli`, and runs the same script. A failed test fails the workflow.

PR validation runs for pull requests targeting `main` that change `src/**`, or manually. It calls BPA, then deploys and refreshes the DEV workspace only if BPA succeeds, then runs the data tests only if deployment and refresh succeed. Each called workflow also supports manual execution. Deployment and tests retain the DEV environment's secrets and approval rules. Matching PRs share the same DEV workspace; fork PRs cannot access deployment secrets.

## Refresh deployed models

With the same dependencies, Fabric CLI authentication and `WORKSPACE_NAME` configuration as the test script, run:

```powershell
python scripts\refresh.py
```

The [refresh script](../../scripts/refresh.py) discovers models under `src` using their `.platform` display names and requests a full refresh for each deployed model, one at a time. It polls the specific refresh every five seconds for up to 600 seconds per model. It prints success only when the refresh completes. A CLI error, API error, unsuccessful refresh or timeout raises an error and stops the script. Timing out does not cancel the refresh in the service.

## Inspection and Validation

Updated HR screenshot documentation on 2026-11-01. All three current Desktop pages were captured and reviewed, with populated charts and no visible visual error messages. The window was not reloaded from disk. See [HR screenshot inspection](hr.report.md#screenshot-inspection-2026-11-01) for capture scope and unverified behavior. Unrelated artifact documentation and screenshots were preserved; the existing customer-comparison document and screenshot coverage gap remains.

The customer-comparison report was added on 2026-10-31 following approval of a separate, one-page monthly comparison using returning customers as existing customers. Report-authoring CLI validation passed with zero errors and warnings. All 36 existing live `Tests.Run` assertions passed against the development sales model. A monthly query returned 34 months with sales, including 22 with existing customers, with zero reconciliation failures and zero negative counts. Local BPA could not run because its Tabular Editor executable requires Windows. Service preview failed with `RENDER_FAILED: CreateReportFailed`, code `401`, request ID `afb450aa-b832-4156-a1c8-02f141e026cb`. No screenshots were captured, so rendering, layout and interactive filtering remain unverified. The report has not been published.

Updated on 2026-10-30 for [returning customers](../specs/returning-customers-202610.md). Coverage includes one model and one report, with five tables, 63 columns, 15 measures, four relationships, one hierarchy, two report pages and nine visuals. Report documentation and screenshots were preserved because no report definitions changed.

Both page screenshots were captured and reviewed. They show the existing Desktop window without a reload from disk. Saved report metadata is authoritative for bindings and calculations; screenshots illustrate the current rendered experience. The KPI heading differs between the window and saved definition. See the [report limitations](sales-overview.report.md#inspection-and-screenshot-limitations).

The model was saved locally, deployed to the configured DEV workspace and refreshed. The deployment script also republished the unchanged report. All 36 `Tests.Run` assertions passed, including the original four; the reused customer measures matched their baseline. Independent first-sale calculations matched 2,815 grouped returning-customer results. Source-data uniqueness and deployed access controls were not tested.

Both artifacts have one document and both report pages retain their screenshots. Updated links were checked. The pre-existing description-spec link above points to a file absent from this worktree; it remains a documentation gap outside this change.
