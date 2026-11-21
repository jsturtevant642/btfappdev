# BTFAPPDEV project state

Updated: 2026-11-19

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

## Portfolio redesign (Nov 2026)

Branch `portfolio-refresh-2026-11` (worktree `../BTFAPPDEV-portfolio`). Not merged, not published.

- **Design system:** `assets/styles.css` replaces the old stylesheet (design direction v2, light only). Canvas `#F3F5F8`, surface `#FFFFFF`, ink `#0D1626`. Bricolage Grotesque 800 for display, Source Sans 3 for body, IBM Plex Mono for labels. Each product has an accent and a stage gradient, set as CSS variables (`--a`, `--stage`, `--stage2`) on its block. `/routine/` and `/routine-ops/` keep their own stylesheets.
- **Pages:** `/` (hero, product index, five product blocks, How we build), `/remix-career/`, `/venture-factory/`, `/jrny/`, `/proxie/`, `/thanks/`, `/404.html`. `/myproxy/` was removed and 301s to `/proxie/` in `_redirects`. Phones sit in a flex row sized by the stage width, so a stage cannot overlap the next block.
- **Internal files:** `_redirects` forces 404 for `/docs/*`, `/package.json`, `/package-lock.json`, `/node_modules/*`, `/netlify/*` and `/netlify.toml`.
- **Images and copy:** copy and alt text come from `/Users/joshuasturtevant/dev/proxie-profile` (`projects.yaml` entries `routine`, `remix-career`, `venture-factory`, `jrny`, `proxie`). Images are copies of `proxie-profile/media/` at `assets/portfolio/<project>/` as WebP (phones 640px wide, browser shots 1600px). Open Graph images are JPEGs in `assets/og/`. Do not edit proxie-profile from this repo.
- **Waitlist forms:** JRNY, Proxie and Remix Career post to `netlify/functions/waitlist.js`. The Proxie form sends `product=Proxie`, which the function stores as given (its label map still lists MyProxy). Earlier MyProxy signups keep the old label.
- **Merge and publish:** production publishes through the Netlify CLI from a `git archive` of the main checkout's HEAD (the ROUTINE autopilot does the same). Merging this branch into `main` therefore puts it in the next publish, so merge only when Josh approves publishing. Steps: review the Netlify draft, `git merge --no-ff portfolio-refresh-2026-11` in `/Users/joshuasturtevant/dev/BTFAPPDEV` on `main`, then publish with the repo's usual production command, then check `/`, `/proxie/`, `/myproxy/` (301), `/docs/PROJECT_STATE.md` (404), `/routine/` and the legal pages. Afterwards `git worktree remove ../BTFAPPDEV-portfolio`.

## Polish pass (2026-11-19)

Branch `site-polish-2026-11` (worktree `../BTFAPPDEV-polish`), built by Cowork from Josh's Nov 19 notes.

- **Home hero:** dark band (`.site-header.dark` + `.top`) with a collage of one real screen per product (`.collage`, sized in container units so it scales as one piece). Each collage item links to its block. Product tiles sit at the bottom of the band.
- **Sticky product rail:** `#rail` appears after the hero and marks the product in view. The inline script at the end of `index.html` drives the rail and the scroll reveal (`.rv`), which only applies to blocks below the first screen and is skipped for reduced-motion users. The page works without the script.
- **Remix Career:** screenshots are now fresh captures of the remixcareer.com marketing site (`assets/portfolio/remix-career/mk-*.webp`, 16:10, captured 2026-11-19 at 2x), plus one sample-report shot. The older `site-*` and `report-*` images were removed.
- **Proxie:** block and page rewritten from `~/dev/Proxie/briefs/proxie-portfolio-entry-brief-2026-11-19.md` in product voice: one Person Model feeding every surface, with each piece marked Live, In use, Designed or Planned. The Person Model diagram is HTML (`.pm`). `assets/portfolio/proxie/galaxy.webp` is the public top level of the galaxy on joshsturtevant.netlify.app, captured with the page text hidden. Concierge is not on this site: the brief leaves that decision to Josh and recommends keeping it behind an access code. Do not add it without his say.
- **JRNY:** the stage is now HTML (`.stage.jr`): mood, kind of story and time chips beside a player card. The image it replaced was removed.
- **Navigation:** product pages carry a product sub-nav (`.subnav`). All five product URLs are unchanged (`/routine/`, `/remix-career/`, `/venture-factory/`, `/jrny/`, `/proxie/`), and so are the ROUTINE support, privacy and terms URLs the App Store listing points at.
- **Footer:** dark, with a contact line. `.proj.flip` now swaps the column widths so the visual keeps the wide column.
- **Remix phone mock (2026-11-20):** the phone in the Remix stage is now a full iPhone screen at real proportions (390x844, status bar and Safari bar drawn in, `.phone.real` sets the frame). It shows the sample client's archetype card (`mk-iphone.webp`); the card beside it is her top direction (`mk-direction.webp`). The Remix page gallery uses `mk-iphone-home.webp` and `mk-iphone-report.webp`. The squat `mk-phone.webp`, `mk-guide.webp` and `mobile-report-overview.webp` were removed. Under 640px the card and phone are sized up so they stay readable.
- **Bottom section + level hero (2026-11-20):** `#approach` on the home page is now an equation heading, "20 years of experience + the power of the latest technologies = Building The Future" (`.eq`; the + and = hang into the left margin above 720px, and "Building The Future" uses the five product colors), with one paragraph in Josh's wording (`.eq-note`). The hero collage cards are level: the `--r` tilts were removed from `.c-web`, `.c-phone`, `.c-galaxy`, `.c-loop` and `.c-audio`.
- **Open with Josh:** the Remix block still says it "had its first paying customer within three weeks" (his wording, Nov 8). `~/dev/concierge/facts/canonical-facts.md` (Nov 11) says never to claim Remix customers. He has been asked which one stands.

