import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/api", () => {
  const api = { get: vi.fn(), post: vi.fn() };
  return { api };
});

import { api } from "@/services/api";
import { candidateApi } from "@/services/candidate.service";

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe("candidateApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createManual posts multipart FormData and unwraps { candidate }", async () => {
    const candidate = { id: "1", name: "Jane" };
    mockApi.post.mockResolvedValue({ data: { candidate } });

    const fd = new FormData();
    fd.append("name", "Jane");
    const res = await candidateApi.createManual(fd);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/candidates",
      fd,
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "multipart/form-data" }),
      })
    );
    expect(res).toEqual(candidate);
  });

  it("bulkUpload appends the file and posts to /candidates/bulk", async () => {
    const summary = { fileName: "c.xlsx", total: 2, success: 2, failed: 0, errors: [] };
    mockApi.post.mockResolvedValue({ data: { summary } });

    const file = new File(["x"], "c.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const res = await candidateApi.bulkUpload(file);

    expect(mockApi.post).toHaveBeenCalledWith(
      "/candidates/bulk",
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "multipart/form-data" }),
      })
    );
    const sentForm = mockApi.post.mock.calls[0][1] as FormData;
    expect(sentForm.get("file")).toBeInstanceOf(File);
    expect(res).toEqual(summary);
  });

  it("getById fetches and unwraps { candidate }", async () => {
    mockApi.get.mockResolvedValue({ data: { candidate: { id: "9" } } });
    const res = await candidateApi.getById("9");
    expect(mockApi.get).toHaveBeenCalledWith("/candidates/9");
    expect(res).toEqual({ id: "9" });
  });

  it("search passes params and returns the paginated body", async () => {
    const body = {
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
    mockApi.get.mockResolvedValue({ data: body });

    const res = await candidateApi.search({ location: "Delhi", skills: ["React", "Node"] });

    expect(mockApi.get).toHaveBeenCalledWith("/candidates", {
      params: { location: "Delhi", skills: ["React", "Node"] },
    });
    expect(res).toEqual(body);
  });

  it("addRemark posts text and unwraps { candidate }", async () => {
    const candidate = { id: "1", remarks: [{ text: "Great" }] };
    mockApi.post.mockResolvedValue({ data: { candidate } });

    const res = await candidateApi.addRemark("1", "Great");

    expect(mockApi.post).toHaveBeenCalledWith("/candidates/1/remarks", { text: "Great" });
    expect(res).toEqual(candidate);
  });

  it("previewResume hits the preview endpoint (no quota)", async () => {
    mockApi.get.mockResolvedValue({ data: { url: "https://x/cv.pdf" } });
    const res = await candidateApi.previewResume("1");
    expect(mockApi.get).toHaveBeenCalledWith("/candidates/1/resume/preview");
    expect(res.url).toBe("https://x/cv.pdf");
  });

  it("downloadResume hits the download endpoint and returns usage", async () => {
    mockApi.get.mockResolvedValue({
      data: { url: "https://x/cv.pdf", usage: { unlimited: false, usedToday: 1, remaining: 9 } },
    });
    const res = await candidateApi.downloadResume("1");
    expect(mockApi.get).toHaveBeenCalledWith("/candidates/1/resume/download");
    expect(res.usage).toMatchObject({ usedToday: 1, remaining: 9 });
  });
});
