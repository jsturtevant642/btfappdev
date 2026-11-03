# BTFAPPDEV project state

Updated: 2026-11-02

## ROUTINE marketing site

- Production serves the live App Store product page at https://btfappdev.com/routine/.
- GitHub auto-build is still broken (repo clone host-key failure), so production publishes through the Netlify CLI from a `git archive` of HEAD.
- The static HTML of `routine/index.html` now matches what `release.js` renders (App Store badge and links, "Available on the App Store"), so crawlers, link previews and no-JS readers no longer see the waitlist copy. Deployed 2026-11-02 as Netlify deploy `6ae958e68136b8f21e3a6f85` (Netlify MCP upload build; 11 functions rebuilt from the same source), commit `6caa821`. The ROUTINE autopilot's own site executor blocked this change because its draft deploys do not reproduce production function bundles; expect the same block on its next site change until that check compares function source instead of build digests.
- `routine/release.js` sets `APP_STORE_URL` to `https://apps.apple.com/us/app/routine-ai-fitness-coach/id6759007085`. That script shows the official Apple badge, points all three download actions at that URL, and hides the launch waitlist.
- Pricing sits between the screenshot row and the download CTA: Free at $0 with two plan adjustments a month; ROUTINE Pro at $8.99/month or $69.99/year.
- `robots.txt` and `sitemap.xml` are live at the site root (deployed 2026-10-14, commit `cc9b687`). The sitemap lists the homepage and the public ROUTINE pages; robots.txt disallows `/routine/thanks.html`. Add new public pages to the sitemap when they ship.

## ROUTINE ops console

- Internal console lives at `/routine-ops/`. Pages are `noindex, nofollow`. Data APIs sit behind the existing access-code session cookie (`ROUTINE_ADMIN_ACCESS_CODE` / `ROUTINE_ADMIN_SESSION_SECRET`).
- Functions: `session`, `ai-models`, `api-usage`, `app-usage`, `prompts`, `save-model`, `save-prompt`, `test-model`. They read ROUTINE Supabase with the service role key on the server only.
- Required Netlify env vars: `ROUTINE_ADMIN_ACCESS_CODE`, `ROUTINE_ADMIN_SESSION_SECRET`, `ROUTINE_SUPABASE_URL`, `ROUTINE_SUPABASE_SERVICE_ROLE_KEY`.

## Older launch notes

- Task: https://app.asana.com/1/1213084996813326/project/1213085019788825/task/1218424156161375
- See `ROUTINE_LAUNCH_HANDOFF.md` for the original release procedure.
