import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api/client";
import { fetchSpots, type Spot } from "./spots";

vi.mock("./api/client", () => ({ api: { GET: vi.fn() } }));

const get = vi.mocked(api.GET) as unknown as ReturnType<typeof vi.fn>;

const spot: Spot = {
  id: "1",
  name: "東京駅",
  category: "交通機関",
  address: "東京都千代田区",
  lat: 35.681236,
  lng: 139.767125,
};

describe("fetchSpots", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("GET /spots のレスポンスをそのまま返す", async () => {
    get.mockResolvedValue({ data: [spot], response: { status: 200 } });

    await expect(fetchSpots()).resolves.toEqual([spot]);
    expect(get).toHaveBeenCalledWith("/spots");
  });

  it("データがなければステータスコード付きでエラーにする", async () => {
    get.mockResolvedValue({ data: undefined, response: { status: 500 } });

    await expect(fetchSpots()).rejects.toThrow("GET /spots responded 500");
  });
});
