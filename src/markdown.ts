import graymatter from "gray-matter";
import { isNotionFrontmatter } from "./notion";
import { markdownToRichText } from "@tryfabric/martian";
import pfs from "node:fs/promises";
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import * as github from "@actions/github";
import path from "node:path";
import { getCtx } from "./actionCtx";
import fs from "fs/promises";

export async function listMdFilesInRepo() {
  const files = await fs.readdir("./");
  return files.filter((file) => file.endsWith(".md"));
}

export async function pushMarkdownFiles() {
  const mdFileNames = await listMdFilesInRepo();
  console.log(mdFileNames);
  for (const mdFileName of mdFileNames) {
    pushMarkdownFile(mdFileName);
  }
}

export async function pushMarkdownFile(mdFilePath: string) {
  console.log(`mdFilePath: ${mdFilePath}`);
  const { notion } = getCtx();
  const fileContents = await pfs.readFile(mdFilePath, { encoding: "utf-8" });
  const fileMatter = graymatter(fileContents);

  console.log(fileMatter.data);

  if (!isNotionFrontmatter(fileMatter.data)) {
    console.log("No notion frontmatter found");
    return;
  }

  console.log("Notion frontmatter found", {
    frontmatter: fileMatter.data,
    file: mdFilePath,
  });

  const pageData = fileMatter.data;
  const pageId = pageData.notion_page.startsWith("http")
    ? path.basename(new URL(pageData.notion_page).pathname).split("-").at(-1)
    : pageData.notion_page;

  if (!pageId) {
    throw new Error("Could not get page ID from frontmatter");
  }

  if (pageData.title) {
    console.log(`Updating title: ${pageData.title}`);
    await notion.updatePageTitle(pageId, pageData.title);
  }

  console.log("Clearing page content");
  await notion.clearBlockChildren(pageId);

  console.log("Adding markdown content");
  await notion.appendMarkdown(pageId, fileMatter.content, [
    createWarningBlock(mdFilePath),
  ]);
}

function createWarningBlock(fileName: string): BlockObjectRequest {
  return {
    type: "callout",
    callout: {
      rich_text: markdownToRichText(
        `This file is linked to Github. Changes must be made in the [markdown file](${github.context.payload.repository?.html_url}/blob/${github.context.sha}/${fileName}) to be permanent.`
      ),
      icon: {
        emoji: "⚠",
      },
      color: "yellow_background",
    },
  };
}
