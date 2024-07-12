import { getInput } from "@actions/core";
import fs from "fs/promises";

const NOTION_TOKEN = getInput("notion-token");

export async function listMdFilesInRepo() {
  const files = await fs.readdir("./");
  return files.filter((file) => file.endsWith(".md"));
}

console.log("Hello via Bun!");

const mdFiles = await listMdFilesInRepo();
console.log(mdFiles);
