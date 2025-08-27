
import { Hono } from 'hono'

import { authRefreshMiddleware } from '../middlewares/auth';

const tokenRoutes = new Hono()

tokenRoutes.get('/refresh', authRefreshMiddleware, async c => {
  const payload = c.get('jwtPayload')
  const userId = payload.id  

  return c.json({
    code: 200,
    msg: 'refresh token 有效',
    userId
  })
})


export default tokenRoutes