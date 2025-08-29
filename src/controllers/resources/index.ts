
//插入

import { Context } from "hono";
import { getD1Database } from "../../types/env";

export async function insertResources(c: Context, film_id: number, resource_url: string, web: number, status: number, created_at: string, updated_at: string) {
    const db = getD1Database(c)
    const result = await db
        .prepare(`INSERT OR IGNORE INTO resources (film_id, resource_url, web, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(film_id, resource_url, web, status, created_at, updated_at)
        .run()
    console.log("资源插入:", film_id , result.success)
    return result
}

