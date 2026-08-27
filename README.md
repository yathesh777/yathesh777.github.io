# Yathesh Kumar P — Portfolio

Vanilla HTML/CSS/JS portfolio with a dark technical/AI aesthetic and responsive interactive UI.

## Deploy on GitHub Pages

1. Create a public repository named `USERNAME.github.io`.
2. Copy all files in this folder into the repository root.
3. Find and replace `https://REPLACE-WITH-USERNAME.github.io/` in the HTML, `robots.txt`, and `sitemap.xml` with the actual GitHub Pages URL.
4. Commit and push.
5. In GitHub: **Settings → Pages → Deploy from a branch → main → / (root)**.
6. Open the deployed site and test all navigation, résumé download, LinkedIn link, and the contact form.
7. Submit `/sitemap.xml` in Google Search Console.

## Notes

- The résumé is copied to `assets/resume.pdf`.
- No profile photo was supplied, so the profile card intentionally uses initials instead of a placeholder image.
- The contact form uses FormSubmit and may ask for one-time email verification on first use.
- Replace the canonical URL placeholder before deployment.


## Recent enhancements

- Reliable native mouse cursor fallback; custom effects never disable the browser pointer.
- Scroll progress indicator and subtle pointer glow/trail on fine-pointer devices.
- Stronger card depth, hover states, focus states, selection styling, and responsive polish.
- Safer client-side search rendering with HTML escaping.
- Improved navigation behavior and reduced-motion handling.


## Advanced features

- Interactive architecture page with retrieval pipeline inspector.
- Project filters and expandable case studies.
- Keyboard command palette (`Ctrl/Cmd + K`).
- Portfolio AI copilot with a local deterministic knowledge base and optional `AI_ENDPOINT`.
- Responsive design, motion-reduction support, visible native cursor fallback, 404 page, and web manifest.

### Optional configuration
Open `assets/main.js` near the `Advanced portfolio interactions` section and set:

```js
const AI_ENDPOINT = 'https://your-api.example.com/chat';
```

The AI endpoint should accept `POST { "message": "..." }` and return `{ "answer": "..." }`.
