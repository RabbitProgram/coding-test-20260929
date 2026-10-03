import { describe, expect, it } from "vitest";
import { pickAddress } from "./reverse-geocode";

describe("pickAddress", () => {
  it("国名と郵便番号を省く", () => {
    expect(
      pickAddress([
        {
          formatted_address: "日本、〒100-0005 東京都千代田区丸の内１丁目",
          types: ["street_address"],
        },
      ]),
    ).toBe("東京都千代田区丸の内１丁目");
  });

  it("Plus Code より、住所の形をした結果を優先する", () => {
    expect(
      pickAddress([
        { formatted_address: "MPXC+XX 千代田区", types: ["plus_code"] },
        { formatted_address: "東京都千代田区", types: ["locality"] },
      ]),
    ).toBe("東京都千代田区");
  });

  it("住所の形をした結果がなければ、先頭を使う", () => {
    expect(
      pickAddress([{ formatted_address: "MPXC+XX", types: ["plus_code"] }]),
    ).toBe("MPXC+XX");
  });

  it("結果がなければ null", () => {
    expect(pickAddress([])).toBeNull();
  });
});
