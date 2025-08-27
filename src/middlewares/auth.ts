import { Context, Next } from "hono"
import { verifyToken } from "../utils/token"
import { Env } from "../types/env"

/**
 * Hono 中间件: 读取 Authorization 并注入用户信息
 */
export const authAccessMiddleware = 
 async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ code: 401, msg: 'Unauthorized: 缺少或无效的 Authorization' }, 401)
    }

    const token = authHeader.slice(7) // 去掉 "Bearer "
    const payload = await verifyToken<{ id: number; type: string }>(token, c.env.JWT_SECRET)

    if (!payload || payload.type !== 'access') {
      return c.json({ code: 401, msg: 'Unauthorized: token 无效或已过期' }, 401)
    }

    // 将用户信息挂载到 Context
    c.set('jwtPayload', payload)
    await next()
  }


export const authRefreshMiddleware = 
async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ code: 401, msg: 'Unauthorized: 缺少或无效的 Authorization' }, 401)
    }

    const token = authHeader.slice(7) // 去掉 "Bearer "
    const payload = await verifyToken<{ id: number; type: string }>(token, c.env.JWT_SECRET)

    if (!payload || payload.type !== 'refresh') {
      return c.json({ code: 401, msg: 'Unauthorized: token 无效或已过期' }, 401)
    }

    // 将用户信息挂载到 Context
    c.set('jwtPayload', payload)
    await next()
  }
