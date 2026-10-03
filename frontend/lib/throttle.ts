// 呼び出しを一定間隔に間引く（デバウンスと違い、連続して呼ばれている間も、間隔ごとに実行される）。
// 最初の呼び出しはすぐに実行し、間引いた分は、最後の引数で、間隔が空いたあとに 1 回だけ実行する。
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  intervalMs: number,
) {
  let lastRun = -Infinity;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: A | undefined;

  const run = (args: A) => {
    lastRun = Date.now();
    fn(...args);
  };

  const throttled = (...args: A) => {
    const wait = intervalMs - (Date.now() - lastRun);
    if (wait <= 0) {
      clearTimeout(timer);
      timer = undefined;
      pendingArgs = undefined;
      run(args);
      return;
    }
    pendingArgs = args;
    timer ??= setTimeout(() => {
      timer = undefined;
      if (pendingArgs) run(pendingArgs);
      pendingArgs = undefined;
    }, wait);
  };

  // 待機中の実行を取り消す（アンマウント時など）
  throttled.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pendingArgs = undefined;
  };

  return throttled;
}
