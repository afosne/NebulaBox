

/**
 * 更具id查询影片详情
 */

import { Context } from "hono";
import { getD1Database } from "../../types/env";
import { Film } from "../../models/films";


export async function getFilmDetail(c: Context, id: number) {
    const db = getD1Database(c)
    const film = await db
        .prepare(`SELECT * FROM films WHERE id = ?`)
        .bind(id)
        .first()
    console.log("影片查询:", film)
    return film
}

export async function getFilmDetailByName(c: Context, name: string) {
    const db = getD1Database(c);
    const film = await db
            .prepare(`SELECT * FROM films WHERE title LIKE ?`)
            .bind(`%${name}%`)
            .all();
        console.log("未定义web查询:", film.results);
        return film.results;
}

//插入影片数据
export async function insertFilm(c: Context, film: any) {
    const db = getD1Database(c)
    const result = await db.prepare(
            `INSERT INTO films (title, episode, category_id, class, cover_url, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            film.title,
            film.episode,
            film.category_id,
            film.type_name || "未知",
            film.cover_url,
            film.description,
            film.created_at,
            film.updated_at
          ).run();
          console.log("插入影片数据:", film.title , result.success);
          return result;
}