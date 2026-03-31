# Handoff: npm Trusted Publishers Migration

**Date:** 2026-03-31
**Branch:** `chore/npm-trusted-publishers`

## What was accomplished

Migrated the release workflow from secret-based npm publishing (`NPM_TOKEN`) to OIDC trusted publishing, added a dry-run mode for testing, and made several related fixes.

### Files changed

- **`.github/workflows/release.yml`** (primary focus)
  - Removed `registry-url` from `setup-node` (it created an `.npmrc` with `_authToken` that overrode OIDC)
  - Removed `NODE_AUTH_TOKEN` / `NPM_TOKEN` env var from the publish step
  - Upgraded Node from 20 to 22; pinned `npm install -g npm@11.12.1` (minimum for OIDC trusted publishing is 11.5.1)
  - Added fork PR guard: `github.event.pull_request.head.repo.full_name == github.repository`
  - Added `workflow_dispatch` trigger with a `version` input for dry-run testing
    - Dry-run mode: sets version in `package.json` + `version.ts` via `npm version --no-git-tag-version --allow-same-version`, runs `npm publish --dry-run` (hits registry to validate OIDC), skips commit/tag/release
    - Real release mode: unchanged behavior with `npm publish --provenance --access public`
  - Removed the "delete release branch" step
- **`package.json`** and **`src/version.ts`**: reverted version from `2.0.0` back to `1.1.0` (v2.0.0 was never published; failed releases left version bumped)
- **`README.md`**: added migration guide callout linking to existing `MIGRATION.md`

### npm side configuration (done by user)

- Trusted publisher configured on npmjs.com for `inoreader-js`: repo `mogita/inoreader-js`, workflow `release.yml`
- `NPM_TOKEN` secret deleted from GitHub repo settings

## Key decisions

- **npm version pinned to 11.12.1**, not `@latest`. npm 11.5.1 is the minimum for OIDC; 11.12.1 was the version at time of fixing. Pinning avoids surprises from future npm releases.
- **No CLI flag to force OIDC exists.** Server-side enforcement is available on npmjs.com: "Require two-factor authentication and disallow tokens" under package publishing access settings. This was recommended to the user but not confirmed as applied.
- **`workflow_dispatch` is always a dry run.** There is no option to do a real publish from manual dispatch. Real releases only flow through the PR merge path. The dispatch input description is labeled `[Dry run]` to make this clear.
- **`npm publish --dry-run` in npm 11 still contacts the registry** and rejects already-published versions. This is why the version sync step applies the input version to `package.json` before the dry-run publish.
- **Removed `registry-url` from `setup-node`** entirely. When set, it creates `.npmrc` with `_authToken=${NODE_AUTH_TOKEN}` which causes npm to prefer token auth over OIDC, even when the env var is empty.

## Important context for future sessions

- **The dry-run was tested and confirmed working** via `workflow_dispatch` on main (after a prior iteration of the branch was merged). The OIDC auth negotiation succeeded. The run that validated this: `actions/runs/23797387324`.
- **`MIGRATION.md` already exists** at repo root with a comprehensive v1-to-v2 guide covering 4 breaking changes (AddSubscriptionParams rename, EditSubscriptionParams.ac enum, getStreamPreferences return type, STREAM_PARAMS.LATEST.r removal).
