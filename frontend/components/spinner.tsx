// 読み込み中を示す、くるくる回る丸
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="読み込み中"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 ${className}`}
    />
  );
}
