import { describe, expect, it } from "vitest";
import { isInBounds, spotsInBounds } from "./bounds";

// 東京周辺
const tokyo = { north: 36, south: 35, east: 140, west: 139 };

describe("isInBounds", () => {
  it("範囲内の点は true、範囲外の点は false", () => {
    expect(isInBounds({ lat: 35.68, lng: 139.76 }, tokyo)).toBe(true);
    expect(isInBounds({ lat: 34.9, lng: 139.76 }, tokyo)).toBe(false); // 南に外れる
    expect(isInBounds({ lat: 35.68, lng: 140.1 }, tokyo)).toBe(false); // 東に外れる
  });

  it("境界線上の点は範囲内として扱う", () => {
    expect(isInBounds({ lat: 36, lng: 139 }, tokyo)).toBe(true);
    expect(isInBounds({ lat: 35, lng: 140 }, tokyo)).toBe(true);
  });

  it("日付変更線をまたぐ範囲（west > east）も判定できる", () => {
    const pacific = { north: 10, south: -10, east: -170, west: 170 };

    expect(isInBounds({ lat: 0, lng: 175 }, pacific)).toBe(true);
    expect(isInBounds({ lat: 0, lng: -175 }, pacific)).toBe(true);
    expect(isInBounds({ lat: 0, lng: 0 }, pacific)).toBe(false);
  });
});

describe("spotsInBounds", () => {
  it("範囲内のスポットだけを、元の順序のまま返す", () => {
    const spots = [
      { id: 1, lat: 35.68, lng: 139.76 },
      { id: 2, lat: 43.06, lng: 141.35 }, // 札幌
      { id: 3, lat: 35.65, lng: 139.74 },
    ];

    expect(spotsInBounds(spots, tokyo).map((s) => s.id)).toEqual([1, 3]);
  });
});
