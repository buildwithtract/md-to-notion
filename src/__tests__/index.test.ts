import { getInput } from "@actions/core";
import fs from "fs/promises";
import { listMdFilesInRepo } from "../index";

jest.mock("@actions/core");
jest.mock("fs/promises");

describe("listMdFilesInRepo", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return an array of markdown files", async () => {
    const mockFiles = ["file1.md", "file2.txt", "file3.md", "file4.js"];
    (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);

    const result = await listMdFilesInRepo();

    expect(result).toEqual(["file1.md", "file3.md"]);
    expect(fs.readdir).toHaveBeenCalledWith("./");
  });

  it("should return an empty array if no markdown files are found", async () => {
    const mockFiles = ["file1.txt", "file2.js", "file3.html"];
    (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);

    const result = await listMdFilesInRepo();

    expect(result).toEqual([]);
    expect(fs.readdir).toHaveBeenCalledWith("./");
  });
});

describe("NOTION_TOKEN", () => {
  it("should get the notion-token input", () => {
    (getInput as jest.Mock).mockReturnValue("mock-token");

    // We need to re-import the module to trigger the getInput call
    jest.isolateModules(() => {
      require("../index");
    });

    expect(getInput).toHaveBeenCalledWith("notion-token");
  });
});
