import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SpotList } from "./spot-list";

const props = { heading: "見出し", selectedId: null, onSelect: vi.fn() };

beforeAll(() => {
  // jsdom には scrollIntoView がない
  Element.prototype.scrollIntoView = vi.fn();
});

describe("SpotList", () => {
  it("0 件のとき「スポットなし」を表示する", () => {
    render(<SpotList {...props} spots={[]} />);
    expect(screen.getByText("スポットなし")).toBeTruthy();
  });

  it("message があるときは「スポットなし」ではなく message を表示する", () => {
    render(<SpotList {...props} spots={[]} message="読み込み中" />);
    expect(screen.getByText("読み込み中")).toBeTruthy();
    expect(screen.queryByText("スポットなし")).toBeNull();
  });

  it("スポットがあるときは「スポットなし」を表示しない", () => {
    render(
      <SpotList
        {...props}
        spots={[{ id: "1", name: "東京駅", category: "駅" } as never]}
      />,
    );
    expect(screen.getByText("東京駅")).toBeTruthy();
    expect(screen.queryByText("スポットなし")).toBeNull();
  });
});
