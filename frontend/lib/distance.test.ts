import { describe, expect, it } from "vitest";
import { formatDistance } from "./distance";

describe("formatDistance", () => {
  it("1000 m 未満は、四捨五入した m で表す", () => {
    expect(formatDistance(0)).toBe("0 m");
    expect(formatDistance(849.6)).toBe("850 m");
  });

  it("1000 m 以上は、小数 1 桁の km で表す", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(1368.4)).toBe("1.4 km");
    expect(formatDistance(12345)).toBe("12.3 km");
  });

  it("四捨五入で 1000 m になる値は、km で表す（「1000 m」と出さない）", () => {
    expect(formatDistance(999.6)).toBe("1.0 km");
  });
});
