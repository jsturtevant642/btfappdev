# BTFAPPDEV project context

This repository serves the public BTF Digital Labs website through Netlify. `netlify.toml` publishes the repository root and uses `netlify/functions` for backend functions.

The ROUTINE marketing page is `routine/index.html`, with `routine/styles.css` and `routine/release.js`. ROUTINE support, privacy and service terms are served under `/routine/`. These are the public website copies referenced by App Store Connect; the separate app repository's Supabase legal upload does not publish this website.

The release URL in `routine/release.js` controls the site's download state. An empty/invalid URL preserves the waitlist; setting a valid URL does not itself publish Netlify or release the iOS app. Changes to production require a scoped, reviewed deployment.

The `/routine/` form stores submissions through the existing `netlify/functions/waitlist.js` endpoint. The release-page switch hides that launch-notification form after release and does not alter or email existing submissions.

Apple badge source: https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg. Use the official artwork unchanged.
