import { D1Database, KVNamespace, R2Bucket } from "@cloudflare/workers-types"
import { Context } from "hono"

export interface Env {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
}

// 对 kv D1 R2 的实例进行封装，提供更简单的使用方式
/**
 * 获取 KV 实例
 */
export function getKVNamespace(c: Context, fallback?: KVNamespace): KVNamespace {
  const kv = (c.env as any)?.KV as KVNamespace | undefined
  if (!kv) {
    if (fallback) {
      console.warn("⚠️ KV not found, using fallback instance.")
      return fallback
    }
    throw new Error("KV is not configured. Please check your wrangler.toml binding.")
  }
  return kv
}

/**
 * 获取 D1 实例
 */
export function getD1Database(c: Context, fallback?: D1Database): D1Database {
  const db = (c.env as any)?.DB as D1Database | undefined
  if (!db) {
    if (fallback) {
      console.warn("⚠️ D1Database not found, using fallback instance.")
      return fallback
    }
    throw new Error("D1Database is not configured. Please check your wrangler.toml binding.")
  }
  return db
}

/**
 * 获取 R2 实例
 */
export function getR2Bucket(c: Context, fallback?: R2Bucket): R2Bucket {
  const r2 = (c.env as any)?.R2 as R2Bucket | undefined
  if (!r2) {
    if (fallback) {
      console.warn("⚠️ R2Bucket not found, using fallback instance.")
      return fallback
    }
    throw new Error("R2Bucket is not configured. Please check your wrangler.toml binding.")
  }
  return r2
}

declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: {
      id: number
      type: string
    }
  }
}
