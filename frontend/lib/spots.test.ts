import { expect, it, vi } from "vitest";
import { api } from "./api/client";
import { fetchSpots } from "./spots";

vi.mock("./api/client", () => ({ api: { GET: vi.fn() } }));

it("データがなければ、ステータスコード付きでエラーにする", async () => {
  vi.mocked(api.GET).mockResolvedValue({
    data: undefined,
    response: { status: 500 },
  } as never);

  await expect(fetchSpots()).rejects.toThrow("GET /spots responded 500");
});
