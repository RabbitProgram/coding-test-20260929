import { describe, expect, it } from "vitest";
import { metersPerPixel } from "./geo";

describe("metersPerPixel", () => {
  it("ズームが 1 上がるごとに、1 ピクセルの距離は半分になる", () => {
    expect(metersPerPixel(35, 11)).toBeCloseTo(metersPerPixel(35, 10) / 2, 6);
  });

  it("赤道より高緯度では、cos(緯度) 倍に小さくなる", () => {
    expect(metersPerPixel(60, 10)).toBeCloseTo(metersPerPixel(0, 10) / 2, 6);
  });

  it("ズーム 10・東京の緯度で、約 124 m（5 km の円は、約 40 px の半径）", () => {
    const mpp = metersPerPixel(35.68, 10);

    expect(mpp).toBeGreaterThan(123);
    expect(mpp).toBeLessThan(125);
    expect(5000 / mpp).toBeGreaterThan(39);
    expect(5000 / mpp).toBeLessThan(41);
  });
});
