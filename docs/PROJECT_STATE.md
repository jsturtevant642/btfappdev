# BTFAPPDEV project state

Updated: 2026-09-12

## ROUTINE launch preparation

- Production still serves the existing waitlist page; no deployment occurred in this work.
- Local changes prepare the App Store CTA switch in `routine/release.js`. `APP_STORE_URL` is deliberately empty. After the app is publicly available, one verified URL updates navigation, hero badge and the lower download section and hides the launch waitlist.
- Copy now states that proposed plan changes require user acceptance. Plain screenshot cards replace simulated phone frames. The official Apple download badge is stored unchanged in `routine/assets/download-on-the-app-store.svg`.
- Verified waitlist and release modes in a real browser, including release mode at 390px width. Verified all three download destinations and hidden waitlist. JavaScript syntax, six release-state/URL cases, and `git diff --check` passed.
- Josh authorized the scoped local commit on 2026-09-12. Next: complete device/operations checks; choose release timing; then authorize app release and the scoped website deployment. See `ROUTINE_LAUNCH_HANDOFF.md`.
- Task: https://app.asana.com/1/1213084996813326/project/1213085019788825/task/1218424156161375
- Claude owns ASC/Mixpanel integration. No analytics, credentials, subscription settings or app code were changed here.
- Existing untracked admin/operations files predate this work and are not part of the Routine launch change.
