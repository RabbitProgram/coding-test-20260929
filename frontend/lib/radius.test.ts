import { describe, expect, it } from "vitest";
import { RADIUS_MAX_KM, RADIUS_MIN_KM, snapRadiusKm } from "./radius";

describe("snapRadiusKm", () => {
  it("1 km 刻み（整数）に丸める", () => {
    expect(snapRadiusKm(5000)).toBe(5);
    expect(snapRadiusKm(5499)).toBe(5);
    expect(snapRadiusKm(5500)).toBe(6);
  });

  it("下限・上限に収める", () => {
    expect(snapRadiusKm(10)).toBe(RADIUS_MIN_KM);
    expect(snapRadiusKm(999_999_999)).toBe(RADIUS_MAX_KM);
  });

  it("上限は 300 km（300 km まではそのまま、超えたら 300 km）", () => {
    expect(snapRadiusKm(300_000)).toBe(300);
    expect(snapRadiusKm(299_000)).toBe(299);
    expect(snapRadiusKm(301_000)).toBe(300);
  });
});
