# ROUTINE website release handoff

Prepared 2026-09-12. Website release completed 2026-09-19: `origin/main` at `ff73789`, Netlify production deploy `6aaf1f0e7a3d3d191abf8137`. Live page: https://btfappdev.com/routine/. GitHub auto-build is still not connected; production publishes through the Netlify CLI.

## Scope

The approved local commit contains only:
- `routine/index.html`
- `routine/styles.css`
- `routine/release.js`
- `routine/assets/download-on-the-app-store.svg`
- `docs/PROJECT_CONTEXT.md`
- `docs/PROJECT_STATE.md`
- `docs/ROUTINE_LAUNCH_HANDOFF.md`

The original launch commit excluded admin tools. Those files are now tracked: `.gitignore`, `routine-ops/`, and the extra Netlify functions for the ROUTINE ops console.

## Release

1. Obtain Josh's explicit app-release/deployment instruction. The parent Asana task is planning and tracking, not release authorization.
2. Confirm the approved app is available on its public App Store page and perform the public-build smoke test.
3. Set `APP_STORE_URL` in `routine/release.js` to that exact verified HTTPS URL. The guard accepts only ROUTINE app ID 6759007085 on apps.apple.com. Campaign parameters supplied by Claude may be retained. Do not invent provider tokens.
4. Review the diff and run `node --check routine/release.js` and `git diff --check`. Preview both the top and lower download actions. All three links should resolve to the configured URL and no launch email form should remain visible.
5. Commit/push/deploy only within Josh's authorized workflow. This repository currently has no `agent-protocol.json`; establish the applicable release checks before production work. Inspect the actual Netlify build/deploy result. The last marketing deployment required a manual CLI publication after the GitHub auto-build did not fire.
6. Verify the deployed page, badge SVG, three links, privacy, terms and support URLs. Record the commit and deployment identifier in project state and the Asana checkpoint. A successful local preview is not deployment evidence.

## Behavior and recovery

Empty or invalid `APP_STORE_URL` leaves the HTML waitlist intact. On a valid URL, the small deferred script sets all three destinations, shows Apple's official badge in the hero, updates availability copy and hides the launch-notification form. This is a JavaScript enhancement; if JavaScript is disabled or fails to load, the HTML fallback is the waitlist. Verify `release.js` is served successfully during deployment.

To roll back the page state, revert the release URL to empty and redeploy the reviewed source. This does not reverse an App Store release.

## Verification already completed

- Browser: waiting state shows notification actions/form; release state shows the official badge and three App Store links, with the form hidden.
- Visual review: desktop and 390px mobile release layout, including lower download section.
- Six URL/state checks: empty, canonical app URL, campaign URL, wrong host, wrong app, malformed URL.
- JavaScript syntax and whitespace/diff checks passed.

## Launch copy and operational checklist

/Users/joshuasturtevant/Documents/New Initiatives/Building The Future/Coding Environment/ROUTINE-launch-kit-2026-09-12.md

Parent task: https://app.asana.com/1/1213084996813326/project/1213085019788825/task/1218424156161375

Claude owns ASC/Mixpanel. No reporting source files, keys, connector permissions or app events are part of this change.
