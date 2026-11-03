
# Executive overview

Fabric Data app prototype for executives, scaffolded from Microsoft's [data app template](https://learn.microsoft.com/fabric/apps/data-apps-template). The spec was waived for this prototype. The UI follows the team's Contoso palette, Segoe UI typography, restrained accents, and responsive layout.

## Metrics and comments

Sales shows Sales Amount, Margin, Sales Qty, and distinct customers with sales for the latest available sales month through the last order date. HR shows HEADCOUNT, FTE, ATTRITION RATE, and SALARY COST for the latest available snapshot month. Attrition uses the model's trailing 12 complete months; salary cost is in synthetic currency units, not payroll.

Each section shows its own period. The source models contain sample data from different years. Blanks are shown as unavailable, not zero. No model definitions are changed and no mock data is shipped.

Select a KPI card, enter up to 2,000 characters, and choose **Save comment**. Comments persist in the app's managed SQL database, keyed by KPI, reporting period, and authenticated owner. The panel loads the latest 50 comments for that KPI and period. Comments are private to the author, not shared executive discussion. The server-side role permits only owner-scoped create and read operations. Text is rendered as plain text. Failed saves retain the draft; switching cards discards unsaved text.

## Run and deploy

Use Node.js 22 or later. In this app directory:

```bash
npm ci
npx rayfin login
npx rayfin login status
```

Rayfin needs its own login, separate from Azure CLI. Use an OS keychain. On Linux without a keychain, review Rayfin's documented token-storage options before explicitly opting into its plaintext fallback. Never commit tokens or generated environment files.

The connectors in `rayfin/rayfin.yml` target workspace `0a6ed388-8f6e-40a0-a9ac-df7d1522ba38` (RR - PBI Factory {dev}), Sales model `7bcdd4c9-3584-4dd7-9268-c5b15cbba485`, and HR model `6c3215b9-c562-46d8-aef8-73e06969717d`. IDs were verified in the workspace. Connector registration could not run without Rayfin login, so configuration follows the documented semantic-model connector contract and must be confirmed at deployment.

Set `WORKSPACE_NAME=RR - PBI Factory {dev}` in the repository's root `.env`, install the repository Python requirements, then run from the repository root:

```bash
python scripts/deploy.py --app-only
```

This deploys the app, comment schema, connectors, and protected static content using `npx rayfin up`. It does not republish or refresh the existing models and reports. The default script behavior without this flag is unchanged.

Deployment generates the app URL and public client configuration in ignored environment files. Return to this directory and run `npm run dev` for local preview against that backend. Open the deployed app in Fabric, or use the portal's `devUri=http://localhost:5173` preview. Fabric sign-in and delegated connector access are preserved. Users need app access plus Build and Read permissions on both models; the Fabric Apps workload and Semantic Model Execute Queries REST API tenant setting must be enabled.

## Validation

```bash
npm test
npm run lint
npm run build:fabric
npm audit --omit=dev
```

Both committed DAX queries were executed successfully against the live development models on 3 November 2026 using Fabric CLI with Azure CLI authentication. Sales returned 1 to 29 February 2020: amount 53,517.038, margin 21,006.098, quantity 239, customers 82. HR returned December 2025: headcount 891, FTE 868.8, attrition 0.050174216027874564, monthly salary cost 5,939,835.8333. Unit tests use these result shapes as fixtures, not runtime fallback data.

Build and lint passed (Fast Refresh and bundle-size warnings remain). The production dependency audit passed after overriding the template's transitive Zod dependency to patched 4.6.7. Compatible audit repairs and patched test/lint packages were applied. The remaining development-only audit findings include MSAL Node (GHSA-xcx6-jx8p-x3h5), glob (GHSA-3g3m-2fjr-6pw4), and minimatch (GHSA-g3hv-75wg-m249), inherited through Rayfin CLI and lint tooling. Upstream-compatible fixes are not available for all of them. Do not expose development tools to untrusted input; no incompatible major overrides were forced.

Deployment was attempted through `scripts/deploy.py --app-only` but blocked by Rayfin's unavailable OS keychain and missing login. Deployed SSO, connector behavior, database persistence, and cross-user policy enforcement remain unverified. The compiled schema's authenticated create/read role, owner predicate, and 2,000-character limit were checked locally. Browser verification confirmed the missing-configuration error is visible without horizontal overflow at mobile size; the signed-in dashboard preview remains blocked. After deployment, save a comment, reload and confirm it persists, switch KPIs and verify isolation, then sign in as another user and confirm the first user's comments cannot be read or created on their behalf. Also test denied model access and desktop/mobile layouts. Local BPA is Windows-only and does not apply to this web app.