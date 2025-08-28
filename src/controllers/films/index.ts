

/**
 * 更具id查询影片详情
 */

import { Context } from "hono";
import { getD1Database } from "../../types/env";


export async function getFilmDetail(c: Context, id: number) {
    const db = getD1Database(c)
    const film = await db
        .prepare(`SELECT * FROM films WHERE id = ?`)
        .bind(id)
        .first()
    console.log("影片查询:", film)
    return film
}

export async function getFilmDetailByName(c: Context, name: string, web?: number) {
    const db = getD1Database(c);
    let film;
    
    if (web === undefined) {
        film = await db
            .prepare(`SELECT * FROM films WHERE title LIKE ?`)
            .bind(`%${name}%`)
            .all();
        console.log("未定义web查询:", film.results);
        return film.results;
    } else {
        film = await db
            .prepare(`SELECT * FROM films WHERE title LIKE ? AND web = ?`)
            .bind(`%${name}%`, web)
            .all();
        console.log("定义web查询:", film.results);
        return film.results;
    }
}
