import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the axios instance module so the service is tested in isolation.
vi.mock("@/services/api", () => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { api };
});

import { api } from "@/services/api";
import { recruiterApi } from "@/services/recruiter.service";

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("recruiterApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("list() passes params and returns the paginated body", async () => {
    const body = { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
    mockApi.get.mockResolvedValue({ data: body });

    const res = await recruiterApi.list({ search: "jane", status: "active", page: 2, limit: 10 });

    expect(mockApi.get).toHaveBeenCalledWith("/recruiters", {
      params: { search: "jane", status: "active", page: 2, limit: 10 },
    });
    expect(res).toEqual(body);
  });

  it("create() posts payload and unwraps { recruiter }", async () => {
    const recruiter = { id: "1", name: "Jane", email: "j@x.com" };
    mockApi.post.mockResolvedValue({ data: { recruiter } });

    const res = await recruiterApi.create({
      name: "Jane",
      email: "j@x.com",
      password: "Passw0rd!",
      dailyDownloadLimit: 10,
      active: true,
    });

    expect(mockApi.post).toHaveBeenCalledWith("/recruiters", expect.objectContaining({ email: "j@x.com" }));
    expect(res).toEqual(recruiter);
  });

  it("setStatus() calls the status endpoint with active flag", async () => {
    mockApi.patch.mockResolvedValue({ data: { recruiter: { id: "1", active: false } } });
    await recruiterApi.setStatus("1", false);
    expect(mockApi.patch).toHaveBeenCalledWith("/recruiters/1/status", { active: false });
  });

  it("remove() deletes by id", async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    await recruiterApi.remove("abc");
    expect(mockApi.delete).toHaveBeenCalledWith("/recruiters/abc");
  });
});
