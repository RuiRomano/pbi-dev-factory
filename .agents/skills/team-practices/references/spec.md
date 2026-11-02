# Write or update a spec

Turn the developer's intent into a short, code-grounded spec and keep it true as the work evolves. Stop after writing or updating the spec for developer review. Do not implement.

**Uses:** [spec template](./templates/spec-template.md); [semantic-model-rules](./rules/semantic-model-rules.md) and [report-rules](./rules/report-rules.md) for the artifacts in scope.

## Checklist

```
- [ ] 1. Find an existing spec
- [ ] 2. Interview the developer
- [ ] 3. Understand the code
- [ ] 4. Write or update the spec
- [ ] 5. Hand off
```

## 1. Find an existing spec

Look in `docs/specs/` for a spec that covers the request. If one exists, update it instead of creating a new one. If several could match, ask which one.

## 2. Interview the developer

Use the request as the starting point. Ask only about missing details, in small rounds, using the question tool when available:

- What outcome do they want, and which model or report is affected?
- What data source, business rules or constraints matter?
- What should stay unchanged, and how will they know the change works?

## 3. Understand the code

Read repository instructions, then inspect `src/`. Locate the relevant semantic models, reports and their dependencies. Read only what you need to understand the request and follow existing patterns. Load the domain skills named in [SKILL.md](../SKILL.md#start-here) and use their tools to inspect real metadata rather than guessing.

Keep inspection read-only. Do not change files under `src/`, modify connected models, refresh data or deploy. If a tool or connection is unavailable, use local files where possible and record what could not be verified. Ask for missing connection or source details instead of inventing them.

Check the current state of the affected objects against the team rules. Note existing deviations; they are context, not part of the change unless the developer says so.

## 4. Write or update the spec

New spec: fill in the [spec template](./templates/spec-template.md) at `docs/specs/<short-feature-name>-<yyyymm>.md`, relative to the repository root. Create the folder if needed. Set **Status** to Draft.

All specs should go to `docs\specs` including the report briefs created by the `powerbi-report-cli` skill.

Existing spec: edit the sections that changed, bump **Updated**, and add a **Change log** entry saying what changed and why. Do not rewrite sections that are still true. Do not overwrite a spec with a different intent; ask first.

Content rules:

- Keep it to roughly one page. Use plain language, real repository paths and concrete model or report object names.
- Fill **Team rules** with the rules that matter for this change. List any planned deviation with its reason so the developer can approve it.
- Separate confirmed facts from open questions. Resolve questions that change the approach before finalizing; leave other unknowns explicit.
- Describe the smallest change that meets the goal and a few acceptance checks that prove it works. Include at least one check that existing behavior still holds.
- No code, no task backlog, no extra sections.

## 5. Hand off

Link to the spec and summarize the proposed change and open questions. State that it is ready for review and has not been implemented. Stop. Implementation needs a separate request and follows [implement](./implement.md).

Add to the report: a **Spec** check with the path and status, and a **Team rules** row listing the rules applied and any proposed deviation.

## When to update a spec

Update the spec, not just the code, when:

- The developer approves it: set **Status** to Approved.
- Implementation starts or finishes: set In progress or Implemented.
- Scope, approach or acceptance checks change during implementation.
- An open question is answered, or a new one appears.
- Tests reveal a result the spec didn't expect.
- The work is dropped: set Abandoned and say why in the change log.
