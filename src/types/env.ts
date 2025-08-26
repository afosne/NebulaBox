import { D1Database, KVNamespace } from "@cloudflare/workers-types"

export interface Env {
  DB: D1Database
  KV: KVNamespace
}
