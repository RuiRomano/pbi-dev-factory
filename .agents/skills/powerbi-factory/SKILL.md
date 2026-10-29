---
name: powerbi-factory
description: 'Use when developing a Power BI feature end to end in this repository: plan a feature, write and review a spec, implement an approved spec, run BPA, test in Fabric, or prepare a pull request.'
---

# Power BI development factory

Keep one agent in control. Use the installed Power BI skills for domain work.
Do not introduce an orchestration service or delegate each phase to another agent.

## 1. Inspect and specify

Read [AGENTS.md](../../../AGENTS.md), inspect `src/`, and check the working tree.
Check for an existing spec before creating another. Gather missing business
requirements, definitions, expected results, and source access from the developer.
Never invent business data or expected metric values.

Create `specs/<feature-slug>.md` using the
[spec template](../../../docs/spec-template.md). Include scope, affected artifacts,
implementation steps, measurable acceptance tests, live test needs, and rollback.
For model/report features, Fabric is the required runtime. Include the configured
development target, the publisher's full-source create/overwrite scope, and
explicit authorization for repeated test publishes in the approval request.
Do not assume that workspace configuration or feature approval alone grants
publishing permission. Record the permission only when it is explicitly granted.
For a new report, load `powerbi-report-cli` planning mode and use its full report
and design contract in this spec. The feature spec is the user-named equivalent
of that skill's `_brief/report-spec.md`; do not keep competing specs.

Set status to `approval_pending`, present the spec, and stop. A request to
"build everything" is not approval of an unseen spec. Do not change `src/` or
publish until the developer explicitly approves in a later reply.

## 2. Implement the approved spec

Record the approval and its scope in the spec. Check repository status and the
remote before creating `feature/<slug>` from the agreed base. Do not discard local
changes, force-push, or silently include unrelated work. If the scope changes,
update the spec and obtain approval again.

Load `semantic-model-authoring` for model work and `powerbi-report-cli` for report
work. Preserve the repository's MCP-only local model editing policy even if a
skill offers a direct-TMDL fallback. Confirm the MCP supports PBIP before using it.
Save/export all changes under `src/`. Run report CLI validation and preview for
report edits according to the sequence below. Keep spec/test code outside `src/`.

Power BI Desktop is not a prerequisite or fallback. Do not discover instances,
connect to localhost, launch Desktop or ask the developer to resolve unsaved
Desktop work. Only an explicitly requested Desktop-specific task uses that path.
Keep the local PBIP authoring connection separate from the Fabric test connection.
If local source or required tools are unavailable, report the blocker.

## 3. Validate and repair

Run from the repository root:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bpa.ps1
```

Read the exit code, console findings, and `.artifacts/bpa/<run>/summary.json`.
Fix every error using the correct domain tools and rerun the full gate. Warnings
are nonblocking under the current policy but must be reported. Do not weaken
rules, add ignore annotations, skip artifacts, or fake success to make CI green.
For factory code changes, also run the tests documented in the README.

For model/report changes, the acceptance loop is mandatory:

1. Persist the local model/report source. Run report CLI validation for report
   changes, and full BPA for all source.
2. Confirm the recorded development publishing authorization covers the current
   target and full-source create/overwrite scope. If absent, obtain explicit
   approval; do not silently substitute Desktop or a static-only test pass.
3. Publish the saved definitions using the existing publisher:

   ```powershell
   python .\scripts\deploy.py --dry-run
   python .\scripts\deploy.py --confirm
   ```

   The second command creates/updates all models and reports in `src/`, not only
   changed items. Reuse `--auth azure-cli` when an Azure CLI login is available.
   Never use a production workspace or delete items as a retry strategy.
   Repeat publishes need no additional approval while within the explicitly
   authorized scope. A changed target or item scope needs new approval.

4. Resolve the published item identities in that workspace. Connect a
   Fabric-capable MCP or supported query tool to the exact deployed model.
   Read back changed definitions and check they match the saved source.
   Configure service connections where required, refresh when needed, and poll
   to terminal success before testing. Stop on credential/permission failures.
5. Execute the spec's known-value DAX assertions against the actual persisted
   measures, including filter and blank/zero cases where relevant. Query-scoped
   copies or overrides are diagnostic aids, not deployment acceptance. Never
   substitute an older loaded model for the just-published model.
6. For report changes, explicitly use service preview against the published
   model and follow the report skill's screenshot review for every affected
   page. Also open the actual published report in the service and verify its
   identity, model binding, rendering, filters and interactions. Local PBIR
   service preview does not persist edits or prove the report was published.
7. Fix failures in local source through the correct authoring tools, save, rerun
   validation, republish and repeat the relevant live tests. Do not fix only the
   remote model and leave the repository stale.

Use the relevant skills and available `fab`, report CLI, MCP and browser tools.
Check installed command help instead of guessing flags. Record workspace/item
identities, tested source revision (or uncommitted source state), definition
readback, refresh outcomes, expected/actual query results and visual evidence.
Evidence must cover the final published source, not an earlier iteration.

If a required live check cannot run, mark the spec `blocked`, state what is
missing, and stop before a ready PR. A draft PR may document the blocker only
when the developer requests it. Optional checks can be not applicable only with
an explicit reason agreed in the spec. Model/report features cannot make all
Fabric verification optional. A report-only change still requires published
report and binding verification; an unchanged model need not be refreshed unless
its data or deployment state requires it. Documentation and factory-only changes
need relevant local checks, not unrelated Fabric writes. PR CI stays offline.

## 4. Deliver a pull request

Review the final source and rerun full BPA after the last saved change. Update
the spec to `verified` with the commands, outcomes, warning summary, and live
evidence. Do not commit local validation outputs, screenshots containing
sensitive data, credentials, caches, or downloaded binaries.

Use [the PR template](../../../.github/pull_request_template.md). Before committing
and pushing, confirm the branch, remote, authenticated account, and intended
staged files. If PR creation is part of the task, use the available PR skill and
`gh pr create --base main`; otherwise report readiness and wait for authorization.
Include the spec, test evidence, and known limitations in the PR.

Wait for `Power BI validation`, fix any failures, and confirm it passes on the
latest PR revision. Do not describe the PR as mergeable until GitHub reports the
required checks and reviews satisfied. The developer reviews and merges.
