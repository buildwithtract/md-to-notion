import * as core from "@actions/core";

import { NotionApi } from "./notion";
import { pushMarkdownFiles } from "./markdown";
import { actionStore } from "./actionCtx";

async function main() {
  console.log("Hello via Bun!");
  try {
    const token = core.getInput("notion-token");
    const notion = new NotionApi(token);

    await actionStore.run({ notion }, pushMarkdownFiles);
  } catch (e) {
    core.setFailed(e instanceof Error ? e.message : "Unknown reason");
  }
}
