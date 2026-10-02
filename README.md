# coding-test-20260929

Next.js + NestJS + PostgreSQL/PostGIS の開発用スケルトン。

| 層 | 技術 | ポート |
|---|---|---|
| frontend | Next.js (App Router) / Tailwind CSS | 3000 |
| backend | NestJS / TypeORM | 3001 |
| db | PostgreSQL 18.6 + PostGIS 3.6 | 5432 |

## 起動

```bash
docker compose up --build
```

`.env` は不要です（既定値で動きます）。変更したい場合は `cp .env.example .env`。

起動時の流れ: `db` が ready → `backend` がマイグレーション実行 → シード投入 → 起動 → `frontend` 起動。

- http://localhost:3000 — Next.js のデフォルトページ
- http://localhost:3001/ — backend が起動していれば `{"status":"ok"}`（エンドポイントはこれだけ）

## DB

- スキーマは TypeORM のマイグレーションのみで管理（`backend/src/database/migrations/`）。`synchronize` は使いません。
- シードは `backend/seeds/seed.csv`（ヘッダ: `name,category,lat,long,address`）。起動時に自動で取り込まれ、`name` をキーに upsert するので、再起動しても重複しません（`name` はCSV内で一意にしてください）。CSV から行を消しても、DB の行は消えません。
- 初期化し直す場合: `docker compose down -v`

## 開発

- ソースはコンテナにマウントされ、ホットリロードされます。
- 依存パッケージを変更したら: `docker compose up --build -V`
- backend のテスト: `cd backend && npm test`（DB 不要）
