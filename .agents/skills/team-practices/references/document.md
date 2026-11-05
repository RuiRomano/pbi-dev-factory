# Document workflow

Generate professional, business-friendly Markdown documentation for every artifact in `src/`, and keep it in step with the code. Save under `docs/project/` unless the developer names another destination.

**When called by implement:** update the affected artifact documents, catalog entries and changed report pages in place. Discover all artifacts to keep the catalog accurate, but preserve unrelated documents and screenshots. Validate coverage and links for the updated content, report existing gaps separately, and return evidence to [implement](./implement.md) for its final report.

## Checklist

```
- [ ] 1. Discover the codebase
- [ ] 2. Gather business context
- [ ] 3. Inspect semantic models
- [ ] 4. Inspect reports and capture pages
- [ ] 5. Write the catalog and artifact documents
- [ ] 6. Validate
```

## 1. Discover the codebase

Find all Power BI artifacts: PBIP entry points, `*.SemanticModel` folders, `*.Report` folders, standalone PBIR definitions and shared resources. Resolve report-to-model bindings. When `docs/project/` already exists, compare it with what you found and update in place rather than starting over.

## 2. Gather business context

Read repository guidance, README files, specs in `docs/specs/`, glossaries and themes. Do not invent business definitions the metadata or repository doesn't support.

## 3. Inspect semantic models

Load `semantic-model-authoring` and use the modeling tools to inspect metadata. Prefer metadata APIs over parsing files by hand. For every model gather purpose, tables, columns, relationships, measures and DAX, hierarchies, calculation groups, security roles, partitions and data sources.

## 4. Inspect reports and capture pages

Load `powerbi-report-cli` and use it to inspect report definitions, pages, visuals, fields, filters, slicers, drillthrough, bookmarks, navigation, themes and bindings.

Render each report and capture one screenshot per page. Store images under `docs/project/assets/<report-name>/<page-name>.png` with stable, descriptive names. Use screenshots to understand flow, main metrics, breakdowns and visible filters; prefer metadata when it gives a more precise answer. If a page can't be rendered, state the limitation in the document instead of describing what it might look like.

## 5. Write the catalog and artifact documents

Output structure:

```text
docs/project/
├── README.md
├── <semantic-model-name>.semantic-model.md
├── <report-name>.report.md
└── assets/
    └── <report-name>/
        └── <page-name>.png
```

- `README.md` is the catalog of every artifact. Use the [catalog template](./templates/docs-catalog.md). Keep it simple, is essentially a index to the other doc files.
- One file per semantic model, named `<name>.semantic-model.md`. Use the [semantic model template](./templates/docs-semantic-model.md).
- One file per report, named `<name>.report.md`. Use the [report template](./templates/docs-report.md).
- Normalize file names to lowercase and use hyphens for spaces or unsupported characters. The type suffix keeps a report and model with the same name apart.
- Use repository-relative source paths and documentation-relative links.

Writing guidance:

- Write for business and technical readers. Concise, factual, plain language.
- Explain what each artifact does in business terms. For measures, explain the calculation, filter behavior, time logic and business nuance rather than restating the name.
- For reports, explain the flow from summary to detail, the main metrics, the breakdowns and the filters.
- Never expose role membership, identities or secrets.
- Omit optional sections only when the metadata is unavailable or not applicable, and say so.

## 6. Validate

- Every discovered model and report is in the catalog and has exactly one document.
- Every report page has a screenshot or an explicit capture limitation.
- All relative links and image paths resolve.
- Mermaid diagrams use valid syntax.
