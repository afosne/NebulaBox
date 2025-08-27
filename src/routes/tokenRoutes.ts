
import { Hono } from 'hono'

import { generateAccessToken } from '../utils/token';
import { authRefreshMiddleware } from '../middlewares/auth';

const tokenRoutes = new Hono()

tokenRoutes.post('/token', authRefreshMiddleware, async (c) => {
    

})

export default tokenRoutes