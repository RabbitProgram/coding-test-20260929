import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { throttle } from "./throttle";

describe("throttle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("最初の呼び出しはすぐに実行する", () => {
    const fn = vi.fn();
    throttle(fn, 1000)("a");
    expect(fn).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("連続して呼ばれている間も、間隔ごとに実行する（デバウンスのように待ち続けない）", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    // 100ms ごとに 2.5 秒間呼ぶ
    for (let t = 0; t < 2500; t += 100) {
      throttled(t);
      vi.advanceTimersByTime(100);
    }
    // 0ms に即時、1000ms ごとの実行では、その直前に呼ばれた引数（900・1900）を使う
    expect(fn.mock.calls.map(([t]) => t)).toEqual([0, 900, 1900]);
  });

  it("間引いた呼び出しは、最後の引数で、間隔が空いたあとに 1 回だけ実行する", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled("first");
    throttled("second");
    throttled("third");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(999);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("third");
  });

  it("間隔が空いたあとの呼び出しは、すぐに実行する", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled("a");
    vi.advanceTimersByTime(1000);
    throttled("b");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
  });

  it("cancel すると、待機中の実行を取り消す", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled("a");
    throttled("b");
    throttled.cancel();
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
