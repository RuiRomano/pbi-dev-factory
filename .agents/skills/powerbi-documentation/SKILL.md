---
name: powerbi-documentation
version: 1.0.0
description: "Generates professional Markdown documentation for Power BI codebases, including a catalog and dedicated documentation for every semantic model and report. Use when documenting PBIP, PBIR, TMDL, semantic models, reports, measures, relationships, report pages, visuals, metrics, filters, or data sources."
---

# Generate Power BI Codebase Documentation

Generate professional, business-friendly Markdown documentation for the Power BI artifacts in a codebase. Unless the user specifies another destination, save all generated documentation under `docs/` at the repository root.

## Required Skills and Inspection

- Load and follow the `semantic-model-authoring` skill before inspecting semantic model metadata. Use the Power BI Modeling MCP and its available behaviors to inspect the model; do not prescribe specific MCP tool names or operation sequences in the generated documentation.
- Load and follow the `powerbi-authoring` skill before inspecting report metadata. Use its available behaviors to inspect report definitions, pages, visuals, filters, themes, and bindings.
- Use the `powerbi-desktop` CLI to render or preview reports and capture a screenshot of every report page. Use screenshots as evidence for understanding the report flow, major metrics, analysis breakdowns, and visible filter experience; do not infer business meaning from layout alone when metadata provides a more precise answer.
- Prefer semantic metadata APIs and structured report metadata over manually parsing generated files. Use repository files as supporting context when needed.

## Workflow

1. **Discover the codebase.** Identify all Power BI artifacts, including PBIP entry points, `*.SemanticModel` folders, `*.Report` folders, standalone PBIR definitions, and relevant shared resources. Resolve report-to-semantic-model bindings where possible.
2. **Gather business context.** Read repository guidance, README files, business glossaries, themes, and other relevant context. Do not invent business definitions that are not supported by metadata or repository context.
3. **Inspect semantic models.** For every model, gather its purpose, tables, columns, relationships, measures, DAX, hierarchies, calculation groups, security roles, partitions, and data sources when available.
4. **Inspect reports.** For every report, gather its purpose, bound semantic model, page order, page names, visuals, visual fields and measures, page/report/visual filters, slicers, drillthrough behavior, bookmarks, and navigation when available.
5. **Capture report pages.** Use the `powerbi-desktop` CLI to capture one screenshot per report page. Store images under `docs/assets/<report-name>/` by default, use stable descriptive file names, and embed relative links in the report document. If a page cannot be rendered, document the limitation instead of fabricating its appearance.
6. **Analyze and explain.** Describe what each artifact does in business terms. For reports, use screenshots and metadata to explain the report flow, main metrics, analysis breakdowns, and available filters. For measures, analyze the DAX and explain the calculation, filter behavior, time logic, and business nuance rather than merely restating the measure name.
7. **Generate the catalog and artifact documents.** Follow the output contract and templates below.
8. **Validate.** Confirm every discovered semantic model and report appears in the catalog and has exactly one artifact document; every report page has a screenshot or an explicit capture limitation; all relative links resolve; and Mermaid syntax is valid.

## Output Contract

Unless told otherwise, create this structure at the repository root:

```text
docs/
├── README.md
├── <semantic-model-name>.semantic-model.md
├── <report-name>.report.md
└── assets/
    └── <report-name>/
        └── <page-name>.png
```

- `docs/README.md` is the catalog of all discovered Power BI artifacts. Include artifact name, type, source path, bound model or dependent reports, documentation link, and a concise purpose statement.
- Create one Markdown file per semantic model directly under `docs/`, named `<artifact-name>.semantic-model.md` (for example, `sales.semantic-model.md`).
- Create one Markdown file per report directly under `docs/`, named `<artifact-name>.report.md` (for example, `sales.report.md`).
- Normalize artifact file names to lowercase and use hyphens for spaces or unsupported path characters. The type suffix prevents a report and semantic model with the same name from colliding.
- Use repository-relative source paths and documentation-relative links.
- Keep generated prose concise, factual, and understandable to business and technical readers.

## Catalog Template

```markdown
# Power BI Artifact Catalog

## Overview
<What this Power BI codebase supports, its business domain, and how its artifacts fit together.>

## Artifacts
| Artifact | Type | Source | Connected artifact(s) | Purpose | Documentation |
|---|---|---|---|---|---|
| <name> | Semantic model / Report | `<path>` | <dependencies> | <summary> | [Open](<relative-link>) |
```

## Semantic Model Template

````markdown
# <Semantic Model Name>

## Overview
<What the model represents, the business processes it supports, its intended audience, and its principal subject areas.>

| Property | Value |
|---|---|
| Source | `<repository path>` |
| Storage mode(s) | <mode> |
| Tables | <count> |
| Measures | <count> |
| Relationships | <count> |

## Model Structure
```mermaid
erDiagram
    <TABLE_A> ||--o{ <TABLE_B> : "<relationship>"
```
<Explain the table roles, relationship directions, cardinalities, inactive relationships, and important modeling implications.>

## Tables and Columns
### <Table Name>
<Purpose and grain of the table.>

| Column | Data type | Visibility | Description |
|---|---|---|---|
| <column> | <type> | Visible / Hidden | <business meaning> |

## Measures
### <Measure Name>
<Business explanation of what the measure calculates, how filters affect it, and any time, currency, ratio, or exception logic.>

```dax
<measure expression>
```

## Security
<RLS/OLS roles and filter behavior, or state that none were found. Do not expose role membership or sensitive identities.>

## Data Sources and Refresh
<Source systems, partitions, storage modes, shared expressions, and refresh considerations that can be established from metadata.>
````

## Report Template

```markdown
# <Report Name>

## Overview
<What the report does, the decisions it supports, its intended audience, and the overall analysis flow.>

| Property | Value |
|---|---|
| Source | `<repository path>` |
| Semantic model | <bound model> |
| Pages | <count> |

## Report Flow
<Explain how users move through the pages and how the analysis progresses from summary metrics to detailed breakdowns.>

## Pages
### <Page Name>
![<Report Name> - <Page Name>](../assets/<report-name>/<page-name>.png)

<Explain the page's purpose and place in the report flow.>

#### Main Metrics
- **<Metric>**: <business meaning and how it is presented or compared.>

#### Analysis Breakdowns
- **<Breakdown>**: <dimensions, categories, trends, comparisons, or drill paths available.>

#### Available Filters
| Scope | Filter or slicer | Behavior / default |
|---|---|---|
| Report / Page / Visual | <field> | <selection, condition, or interaction> |

#### Interactions and Navigation
<Bookmarks, buttons, drillthrough, tooltips, cross-filtering, and navigation relevant to using this page.>

## Global Filters and Navigation
<Report-level filters, persistent slicers, navigation patterns, and shared interaction behavior.>
```

Omit optional sections only when the metadata is genuinely unavailable or not applicable, and state material inspection or screenshot limitations explicitly.
