import { D1Database } from '@cloudflare/workers-types'


export const query = async <T>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T[]> => {
  const stmt = db.prepare(sql).bind(...params)
  const result = await stmt.all<T>()
  return result.results
}
