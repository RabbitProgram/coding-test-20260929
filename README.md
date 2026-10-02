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

`.env` がなくても起動します（既定値で動きます）。ただし、地図を表示するには Google Maps の API キーが必要です。

```bash
cp .env.example .env
# .env の NEXT_PUBLIC_GOOGLE_MAPS_API_KEY に API キーを設定
docker compose up
```

API キーは Google Cloud で「Maps JavaScript API」を有効化して発行します。ブラウザに公開されるキーなので、「HTTPリファラー」と「API」の制限を必ず設定してください。

起動時の流れ: `db` が ready → `backend` がマイグレーション実行 → シード投入 → 起動 → `frontend` 起動。

- http://localhost:3000 — スポットをマーカー表示する地図（要 API キー）
- http://localhost:3001/ — backend が起動していれば `{"status":"ok"}`
- http://localhost:3001/spots — スポット一覧（JSON）
- http://localhost:3001/docs — Swagger UI（開発時のみ。`NODE_ENV=production` では無効）／ `/docs-json` は OpenAPI 仕様

## DB

- スキーマは TypeORM のマイグレーションのみで管理（`backend/src/database/migrations/`）。`synchronize` は使いません。
- シードは `backend/seeds/seed.csv`（ヘッダ: `name,category,lat,long,address`）。起動時に自動で取り込まれ、`name` をキーに upsert するので、再起動しても重複しません（`name` はCSV内で一意にしてください）。CSV から行を消しても、DB の行は消えません。
- 初期化し直す場合: `docker compose down -v`

## 開発

- ソースはコンテナにマウントされ、ホットリロードされます。
- 依存パッケージを変更したら: `docker compose up --build -V`
- backend のテスト: `cd backend && npm test`（DB 不要）。e2e は `npm run test:e2e`
- frontend のテスト: `cd frontend && npm test`（Vitest + Testing Library）

## API の型（backend → frontend）

フロントの API 呼び出しは、backend の定義から自動生成した型で保護されています（URL や項目名の typo はコンパイルエラーになります）。

```
backend の DTO/コントローラー
  → backend/openapi.json（OpenAPI 仕様）
  → frontend/lib/api/schema.d.ts（型）
  → frontend/lib/api/client.ts（openapi-fetch の型付きクライアント）
```

backend の API（エンドポイントやレスポンス）を変えたら、次の順に実行します。

```bash
cd backend && npm run openapi     # openapi.json を更新（DB 不要）
cd ../frontend && npm run api:types  # schema.d.ts を更新
```

`openapi.json` の更新を忘れると、backend のテスト（`npm test`）が失敗します。
