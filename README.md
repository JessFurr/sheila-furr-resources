# Dr. Sheila Cohen Furr, Ph.D.

Website for Dr. Sheila Cohen Furr, Ph.D. — a Board Certified Psychologist and
Accredited Collaborative Professional in Boca Raton, FL, serving families
before, during, and after divorce through collaborative divorce, mediation,
child specialist work, and family therapy.

**Live site:** https://sheila-furr-resources.vercel.app

## Stack

Static site built with [Eleventy](https://www.11ty.dev/). No CMS, no database,
no server — every page is plain HTML at build time, so it's fast, cheap to
host, and has no plugin or platform security surface to maintain.

- `_includes/base.njk` — shared layout (head/meta, nav, footer) used by every page
- `_data/site.json` — site-wide constants (phone, email, address, etc.)
- `index.html`, `about.html`, `services.html`, `peaceful-uncoupling.html`,
  `resources.html`, `contact.html`, `blog.html`, `blog-*.html` — one page each,
  frontmatter + unique content only
- `bauhaus.css` — the design system (single stylesheet, no build step needed for CSS)

## Local development

```bash
npm install
npm run serve      # http://localhost:8080, rebuilds on save
```

## Build

```bash
npm run build       # outputs static HTML to _site/
```

## Deploy

Pushing to `main` on GitHub automatically triggers a production deploy on
Vercel (see `vercel.json` for the build command/output directory). No manual
deploy step needed.

## SEO / AEO

Every page has a unique meta description, Open Graph/Twitter tags, and a
canonical URL. The homepage carries `ProfessionalService` structured data;
Resources has a visible FAQ section with matching `FAQPage` schema; each blog
post carries `BlogPosting` schema. `robots.txt` and `sitemap.xml` are at the
site root.

---

© Sheila C. Furr, Ph.D., ABN. All rights reserved.
