import graymatter from "gray-matter";
import { isNotionFrontmatter } from "./notion";
import { markdownToRichText } from "@tryfabric/martian";
import pfs from "node:fs/promises";
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import * as github from "@actions/github";
import path from "node:path";
import { getCtx } from "./actionCtx";
import fs from "fs/promises";

export async function listMdFilesInRepo(dir: string = "./"): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listMdFilesInRepo(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
}

export async function pushMarkdownFiles() {
  const mdFilePaths = await listMdFilesInRepo();
  for (const mdFilePath of mdFilePaths) {
    const fileContents = await pfs.readFile(mdFilePath, { encoding: "utf-8" });
    const fileMatter = graymatter(fileContents);
    if (isNotionFrontmatter(fileMatter.data)) {
      console.log("Notion frontmatter found", {
        frontmatter: fileMatter.data,
        file: mdFilePath,
      });
      await pushMarkdownFile(mdFilePath, fileMatter);
    }
  }
}

export async function pushMarkdownFile(mdFilePath: string, fileMatter: any) {
  console.log(`mdFilePath: ${mdFilePath}`);
  const { notion } = getCtx();

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
