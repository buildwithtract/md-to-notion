import { getInput } from "@actions/core";

const NOTION_TOKEN = getInput("notion-token");

console.log("Hello via Bun!");
