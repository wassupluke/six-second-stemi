# The 6 Second STEMI

A client-side STEMI-recognition trainer modeled on the SkillStat 6-Second ECG simulator.
Static build, no backend, no runtime network — safe under isolated/proxied networks.

## Develop
- `npm install`
- `npm run dev`
- `npm run test:run`

## Deploy (GitHub Pages + Cloudflare)
1. Repo Settings → Pages → Source: **GitHub Actions**.
2. Push to `main`; the `Deploy to GitHub Pages` workflow tests, builds, and publishes `dist/`.
3. Set the real domain in `public/CNAME` (currently a placeholder).
4. In Cloudflare DNS, point the domain at the Pages site (CNAME to `<user>.github.io`, proxied).
   `vite.config.js` uses `base: '/'`, correct for a root custom domain.
