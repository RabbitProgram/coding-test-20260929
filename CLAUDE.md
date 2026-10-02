# CLAUDE.md

位置情報（スポット）を地図にマーカー表示するアプリ。Next.js + NestJS + PostgreSQL/PostGIS のモノレポ（Docker Compose）。
やり取りとコードコメントは日本語で書く。

## 構成

| ディレクトリ | 内容 |
|---|---|
| `backend/` | NestJS 12（ESM）/ TypeORM 1.x / Vitest 5 / oxlint |
| `frontend/` | Next.js 16（App Router）/ Tailwind CSS 4 / `@vis.gl/react-google-maps` / Vitest 5 + Testing Library |
| `backend/seeds/seed.csv` | シードデータ（起動時に DB へ自動投入） |
| `docker-compose.yml` | `db`（`postgis/postgis:18-3.6`）/ `backend` / `frontend` |

- 起動: `docker compose up`（`.env` は任意。地図には `.env` の `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` が必要）
- Docker は OrbStack ではなく Docker Desktop を使う（`DOCKER_CONTEXT=desktop-linux`）
- 詳しい URL や手順は [README.md](README.md)

## 作業の流れ

機能の追加・変更は、次の順に進める。

1. **調べる**: 既存のコードと、下記の「参照するスキル・ドキュメント」を先に読む。
2. **実装する**: 既存コードの書き方・命名・コメントの量に合わせる。
3. **Vitest でユニットテストを書く**: 実装とセットで必ず書く（後回しにしない）。
4. **確認する**: テスト・lint・型チェック・ビルドを実行する。DB や画面に関わる変更は、`docker compose up` で実際に動かして確認する。
5. **報告する**: 確認できたことと、確認できなかったことを分けて伝える。コミットは、依頼されたときだけ行う。

### テストの書き方（Vitest）

backend / frontend の両方で Vitest 5 を使う。書く前に、[vitest スキル](.agents/skills/vitest/SKILL.md)（Vitest 5 向け）を参照する。

- **DB やネットワークなしで動くテスト**にする。外部との境界は、モックやスタブに差し替える。
- 正常系だけでなく、不正値・境界・エラーのケースも書く。
- 壊れたときに失敗するテストにする（書いたら、実装を一時的に壊して、失敗することを確かめる）。
- **自前のロジックを対象にする**。ライブラリをモックして、配線（定数と同じ値、要素の数など）を確かめるだけのテストは書かない。地図の描画そのものは、Vitest では検証できない（ブラウザで確認する）。

| | backend | frontend |
|---|---|---|
| ファイル | ソースの隣に `*.spec.ts`。HTTP 層は `test/*.e2e-spec.ts` | ソースの隣に `*.test.ts` / `*.test.tsx` |
| 環境 | Node（`@nestjs/testing`、サービスはスタブ） | jsdom + `@testing-library/react`（`vitest.config.mts`） |
| 実行 | `cd backend && npm test` / `npm run test:e2e` / `npm run lint` | `cd frontend && npm test` / `npm run lint` / `npx tsc --noEmit` |

- backend: 純粋な関数は、切り出して直接テストする（例: `seed-loader.ts`、`toSpotResponse`）。
- frontend: API 呼び出しは `./api/client` をモックしてテストする（例: `lib/spots.test.ts`）。地図コンポーネント（`components/spot-map.tsx`）は、Google Maps のモックが必要で、配線の確認にしかならないため、テストしない（ブラウザで確認する）。テストしたいロジックが増えたら、地図から切り離した関数やフックにして、直接テストする。
- frontend: **`async` なサーバーコンポーネント（`app/page.tsx` など）は、Vitest でテストできない**。ロジックを、`lib/` や同期のコンポーネントに切り出してテストし、ページ自体は `docker compose up` で動作を確認する。

## 参照するスキル・ドキュメント

| 作業 | 参照先 |
|---|---|
| DB 設計・SQL・マイグレーション・PostGIS | [postgres スキル](.agents/skills/postgres/SKILL.md)（PostGIS は `references/design-postgis-tables.md`）。プラグイン `pg@aiguide` でも利用できる |
| テストの書き方 | [vitest スキル](.agents/skills/vitest/SKILL.md) |
| Docker / Compose | プラグイン `docker-skills@docker`（`.claude/settings.json`） |
| Next.js | `frontend/AGENTS.md` の指示に従い、`frontend/node_modules/next/dist/docs/` を読んでから書く（学習データと API が異なる） |

スキルは、`.agents/skills/` と `skills-lock.json` で管理している。追加するときは `npx skills add <リポジトリ> --skill <名前>`。

## 規約

### バックエンド
- **スキーマの変更はマイグレーションのみ**（`backend/src/database/migrations/`）。`synchronize` は使わない。ファイル名は `kebab-case.ts`、クラス名の末尾に 13 桁のタイムスタンプを付ける（TypeORM の仕様）。
- **シード**は `backend/seeds/seed.csv`。`name` をキーに upsert するので、何度起動しても重複しない。`name` は CSV 内で一意にする。
- **PostGIS**: 座標は `geography(Point, 4326)`。**経度, 緯度の順**（`ST_MakePoint(lng, lat)`、GeoJSON も同じ）。距離の絞り込みは `ST_Distance` ではなく `ST_DWithin`。値はパラメータ化して渡す。
- **エンドポイントは、依頼されたときだけ追加する**。

### API の型（backend → frontend）
backend の API を変えたら、次の順に更新する。`schema.d.ts` は手で編集しない。

```bash
cd backend && npm run openapi         # DTO（@ApiProperty / @ApiOperation）→ openapi.json
cd ../frontend && npm run api:types   # openapi.json → lib/api/schema.d.ts
```

- レスポンスは DTO クラス（`@ApiProperty` に `description` を付ける）で定義し、`@ApiOkResponse` を付ける。
- `openapi.json` の更新を忘れると、backend のテスト（`src/openapi/openapi.spec.ts`）が失敗する。
- フロントは、`lib/api/client.ts` の型付きクライアント（`openapi-fetch`）で呼ぶ。素の `fetch` と `as` でのキャストは使わない。
- Swagger UI は `/docs`（`NODE_ENV=production` では無効）。

### パッケージ
- 追加・更新は、最新の安定版を使う。互換性がなくて上げられないものは、理由を報告する。
- 次のものは、意図して固定・据え置きしている。
  - `@nestjs/core` 12.1.2 / `@nestjs/cli` 12.0.8（指定バージョンに固定）
  - `typescript` は 6.x（7 は Nest CLI が未対応。frontend は `typescript-eslint` が 6.1 未満まで）
  - `eslint`（frontend）は 9 系（10 は Next.js の設定が使うプラグインが未対応）
  - `@types/node` は 24 系（実行環境 Node 24 に合わせる）
- 依存を変えたら、`docker compose up --build -V` で作り直す。

### その他
- **秘密情報**: `.env` はコミットしない。API キーを、出力や報告に貼らない。
- **テーブル名やマイグレーション名を変えたとき**は、既存の DB と食い違うので、`docker compose down -v` でボリュームを作り直す。
- 地図の初期位置は、東京駅（縮尺 13）。`frontend/components/spot-map.tsx`。
