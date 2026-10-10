# Sheila Furr website

Eleventy static site (Dr. Sheila Cohen Furr). Personal project, public content. Pushes to `main` auto-deploy on Vercel.

## Rules

1. **Commit and push every change to `main` right away**, no asking. Stage only the files touched.
2. **Keep the JSON-LD in sync with every change.** Whenever page content, facts or URLs change, update that page's `schema` frontmatter in the same commit. This covers:
   - `index.html`: `@graph` with `ProfessionalService` (name, description, phone, address, service area, URL, image) `hasCredential` (the 5 certifications, which are also shown on the home page and in the About page's Certifications column; keep all three in sync), and `FAQPage` for the 4 FAQs shown on the home page. Those 4 are copies of entries on `resources.html`; if either wording changes, update both pages' HTML and schema.
   - `resources.html`: `FAQPage` (must match the visible FAQ Q&As word for word).
   - each `blog-*.html`: `BlogPosting` (headline, description, URLs).
   Also check the `title` and meta `description` frontmatter for the same page. If a change touches a fact that appears in several places (phone, address, service area, tagline), update all of them.
3. **Never put the email address in the HTML or JSON-LD.** Email links are built by `contact-email.js`.
4. URLs are folder-style (`/about/`, `/blog/parenting-schedules/`). Use root-relative asset paths. Update `sitemap.xml` when pages are added or renamed, and add a 301 in `vercel.json` for any renamed URL.
5. Building inside the Drive folder hangs. To verify, rsync to the scratchpad (excluding `node_modules`, `_site`, `.git`), `npm install`, then `npx @11ty/eleventy`.
6. **Section order matters in `bauhaus.css`.** Backgrounds and text colors alternate via `section:nth-of-type(even)` rules, so inserting or removing a section on a page flips the parity of everything after it. After adding a section, check the sections below it (e.g. the dark CTA banner text) still look right.
7. **Fonts:** headings use DM Serif Display (`--serif`, single weight, so no bold). Subtitles and lead paragraphs under headings use Josefin Sans (bauhaus.css line ~113). Body is Source Sans 3; the name and some labels use Archivo Black. Zen Kurenaido is no longer used.
8. **Services page** has two buckets chosen by the header buttons: "Life Challenges & Transitions" (default) and a "Divorce" dropdown (Before / During / After). Each is a `.svc-panel` toggled by inline JS; old `#before`, `#during`, `#after` links still open the right panel.
9. **Motion:** subtle, site-wide, and disabled for `prefers-reduced-motion`. Hero fade-in and button/card hover lifts are CSS at the end of `bauhaus.css`; scroll-in reveals come from `reveal.js` (a selector list at the top of that file chooses which elements animate; add new card/section classes there).
