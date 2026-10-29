## Change

What changed and why:

Spec: <!-- Link to specs/<feature>.md and its recorded approval. -->

## Validation

- [ ] Final saved source passed `pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bpa.ps1`.
- [ ] All error-level findings are fixed. No rules were weakened or bypassed.
- [ ] Spec acceptance tests passed. Results and warning summary are recorded.
- [ ] Model changes were saved from MCP into `src/`.
- [ ] Required report previews and live tests are recorded, or not applicable with a reason.
- [ ] Model changes were read back in Fabric and actual persisted measures passed the required tests, or no model behavior changed.
- [ ] Report changes passed service screenshot review and actual published-report identity, binding, rendering and interaction checks, or no report changed.
- [ ] Live evidence covers the final published source. No Desktop or query-scoped substitute was used as deployment evidence.
- [ ] No credentials, `.env`, caches, or unrelated changes are included.

Commands, results, warnings, and live-test evidence:

For model/report features, include the authorized development workspace/item
scope, tested source revision or uncommitted state, refresh outcomes where needed,
expected/actual query results and report evidence. Missing required Fabric tests
blocks a ready PR. Factory-only and documentation changes need no Fabric writes.

## Review and rollback

Known limitations, development workspace changes, and rollback steps:
