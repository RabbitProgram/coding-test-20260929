import createClient from "openapi-fetch";
import type { paths } from "./schema";

// サーバーコンポーネント専用。docker compose 内では http://backend:3001 を指す
const API_URL = process.env.API_URL ?? "http://localhost:3001";

// パスやレスポンスの型は、backend の OpenAPI から生成した schema.d.ts で決まる
export const api = createClient<paths>({
  baseUrl: API_URL,
  cache: "no-store",
});
