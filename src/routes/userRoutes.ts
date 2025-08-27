import { Hono } from 'hono'
import { register } from '../services/register'

const userRoutes = new Hono()

userRoutes.post('/register', async c => {
  const { username, password, email } = await c.req.json()
  const data = await register(c, { username, password, email })
  return c.json(data)
})

export default userRoutes
