import { KVNamespace } from "@cloudflare/workers-types"

export class KVCache {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key)
    return value ? JSON.parse(value) : null
  }

  async set<T>(key: string, value: T, ttl: number = 60): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl })
  }

  async del(key: string): Promise<void> {
    await this.kv.delete(key)
  }
}
