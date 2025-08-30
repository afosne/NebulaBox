
import { Context } from "hono";
import { getD1Database } from "../../types/env";


export async function getActiveParsers(c: Context) {
    const db = getD1Database(c)
    const result = await db
    .prepare('SELECT * FROM parsers WHERE status = 1')
    .all()
    console.log("获取所有 Pasers" , result)
    return result
}

export async function getOneParser(c: Context, id: number) {
    const db = getD1Database(c)
    const result = await db
    .prepare('SELECT * FROM parsers WHERE id = ? AND status = 1')
    .bind(id)
    .first()
    console.log("获取单个Paser" , result)
    return result
}

export async function getParsers(c: Context) {
    const db = getD1Database(c)
    const result = await db
    .prepare('SELECT * FROM parsers')
    .all()
    console.log("获取所有 Pasers" , result)
    return result
}