/** 住所のキャッシュ。保存先（Redis）を差し替えられるように、必要な操作だけを切り出す */
export interface AddressCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<unknown>;
}

export const ADDRESS_CACHE = Symbol('ADDRESS_CACHE');

/** Redis クライアントのうち、使う操作だけ */
export interface RedisLike {
  get(key: string): Promise<unknown>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
}

export const redisAddressCache = (client: RedisLike): AddressCache => ({
  get: async (key) => (await client.get(key)) as string | null,
  set: (key, value, ttlSeconds) => client.set(key, value, { EX: ttlSeconds }),
});
