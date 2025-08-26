import { Context, Next } from 'hono'

export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  // TODO: 校验 JWT 或 session
  await next()
}
