import { Context } from "hono"
import { getD1Database } from "../types/env"
import { getUserId } from "../controllers/user"

/**
 * 通过freshToken 获取 AccessToken
 * @param c
 * @param freshToken
 */
export async function getAccessToken(c: Context, freshToken: string) { 

}