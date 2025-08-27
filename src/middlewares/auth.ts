import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ message: '未提供有效的访问令牌' }, 401)
    }
    const token = authHeader.split('Bearer ')[1]
        if (!token) {
      return c.json({ message: '令牌格式不正确' }, 401)
    }
    const payload = await verify(token, c.env.JWT_SECRET)
    if (!payload) {
      return c.json({ message: '令牌验证失败' }, 401)
    }
    const id = payload.id
    c.set('user', {
      id: id
    })
  await next()
}
