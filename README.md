# md-to-notion

Markdown files you want to convert across need to have this at the top of the file:

```
---
notion_page: <your-notion-page-url>
title: <your-notion-page-title>
---
```

This will only work on Notion pages that you have already created.

You also need to create an internal Notion integration [here](https://www.notion.so/profile/integrations)

You then need to enable that integration for the page or a parent of it.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.28. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
