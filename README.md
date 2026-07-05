# The 6 Second STEMI

A client-side STEMI-recognition trainer modeled on the SkillStat 6-Second ECG simulator.
Static build, no backend, no runtime network — safe under isolated/proxied networks.

## Develop
- `npm install`
- `npm run dev`
- `npm run test:run`

## Deploy (GitHub Pages)

This repo publishes as a **project page** under the account's user site
(`wassupluke.github.io`, custom domain `wassupluke.com`), so the live URL is
`https://wassupluke.com/six-second-stemi/`.

1. Repo Settings → Pages → Source: **GitHub Actions** (branch/"legacy" mode
   cannot run `vite build`, so it can't serve this app).
2. Push to `main`; the `Deploy to GitHub Pages` workflow tests, builds, and
   publishes `dist/`.
3. `vite.config.js` uses `base: '/six-second-stemi/'` so assets resolve under
   the project subpath. There is intentionally **no `CNAME`** here — the user
   site (`wassupluke.github.io`) owns `wassupluke.com`; a project CNAME would
   claim the apex and break the user-site routing.
4. The domain's DNS is configured on the user site, not here.
