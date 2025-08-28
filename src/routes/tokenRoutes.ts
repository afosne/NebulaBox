
import { Hono } from 'hono'

import { authRefreshMiddleware } from '../middlewares/auth';
import { refreshToken } from '../services/auth/refreshToken';

const tokenRoutes = new Hono()

tokenRoutes.get('/refresh', authRefreshMiddleware, async (c)=> {
  const result = await refreshToken(c)
  return c.json(result)
})


export default tokenRoutes