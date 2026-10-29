---
name: team-spec
description: "Start a new Power BI development or refactor in this repository."
argument-hint: "Describe the feature or refactor you want to start"
---

# Start a Development

Turn the developer's intent into a short, code-grounded spec. Stop after writing
the spec for developer review. Do not implement the feature.

Example:

```text
/factory-dev help me refactor the semantic model to use currency conversion using datasource X
```

## 1. Interview the developer

Use the request as the starting point. Ask only about missing details, in small
rounds, using the question tool when available:

- What outcome do they want, and which model or report is affected?
- What data source, business rules, or constraints matter?
- What should stay unchanged, and how will they know the change works?

## 2. Understand the code

Read repository instructions, then inspect `src/`. Locate the relevant semantic
model, reports, and their dependencies. Read only the files needed to understand
the request and follow existing patterns.

Load the applicable skills before domain-specific inspection:

- `semantic-model-authoring` for semantic models, DAX, relationships, and data sources.
- `powerbi-report-cli` for report pages, visuals, filters, and model bindings.
- Both when the change affects the model and reports.

Use available tools to inspect actual metadata rather than guessing. Discover
the semantic model MCP tools.

Keep inspection read-only. Do not change files under `src/`, modify connected
models, refresh data, or deploy anything. If a tool or connection is unavailable,
use local files where possible and record what could not be verified. Ask for
missing connection or source details instead of inventing them.

## 3. Write the spec

Read [the spec template](./references/spec-template.md) and fill it in at
`docs/specs/<short-feature-name>-<yyyymm>.md`, relative to the repository root.
Create the folder if needed. Do not overwrite an existing spec without approval.

Keep the spec to roughly one page. Use plain language, actual repository paths,
and concrete model or report object names. Separate confirmed facts from open
questions. Resolve questions that materially change the approach with the
developer before finalizing; leave other unknowns explicit.

Describe the smallest change that meets the goal and a few checks that prove it
works. Do not add code, a task backlog, or extra template sections.

## 4. Hand off

Link to the saved spec and briefly summarize the proposed change and any open
questions. State that it is ready for review and has not been implemented.
Stop here. Implementation requires a separate developer request.
