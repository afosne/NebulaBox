import { Hono } from 'hono'
import { register } from '../services/register'
import { use } from 'hono/jsx'
import { login } from '../services/login'

const userRoutes = new Hono()

userRoutes.post('/register', async c => {
  const { username, password, email } = await c.req.json()
  const data = await register(c, { username, password, email })
  return c.json(data)
})

userRoutes.post('/login', async c => {
  const { username, password } = await c.req.json()
  const data = await login(c, { username, password })
  return c.json(data)
})

export default userRoutes
