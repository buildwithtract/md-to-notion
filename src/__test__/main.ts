import path from "node:path";
import * as core from "@actions/core";

import { NotionApi } from "../notion";
import { pushMarkdownFiles } from "../markdown";
import { actionStore } from "../actionCtx";

import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "@/.env") });

async function main() {
  console.log("Hello via Bun!");
  try {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error("NOTION_TOKEN is not set in the .env file");
    }
    const notion = new NotionApi(token);

    await actionStore.run({ notion }, pushMarkdownFiles);
  } catch (e) {
    core.setFailed(e instanceof Error ? e.message : "Unknown reason");
  }
}

main();
