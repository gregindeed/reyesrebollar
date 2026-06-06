# Brand Assets

This folder contains all client-specific brand assets for this propframe deployment.

## Required files

| File | Source | Notes |
|---|---|---|
| `logo.png` | `public/reyesrebollar_logo.png` | Copy and rename |
| `hero.jpg` | `public/el-cajon-aerial.jpg` | Copy and rename |
| `favicon.ico` | `public/favicon.ico` | Copy here |
| `og-image.png` | _(create)_ | 1200×630px social share image |

## Setup commands

Run these once from the project root to populate this folder:

```bash
cp public/reyesrebollar_logo.png public/brand/logo.png
cp public/el-cajon-aerial.jpg public/brand/hero.jpg
cp public/favicon.ico public/brand/favicon.ico
```

## Per-client usage

When setting up a new client deployment, replace the files in this folder.
The filenames (`logo.png`, `hero.jpg`, etc.) must stay the same — only the
file contents change. `site.config.ts` references these stable paths.
