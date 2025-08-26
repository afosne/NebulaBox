import { Hono } from 'hono'
import { getUsers, createUser } from '../controllers/userController'
import { Env } from '../types/env'

const userRoutes = new Hono<{ Bindings: Env }>()

userRoutes.get('/', async c => {
  const users = await getUsers(c.env)
  return c.json(users)
})

userRoutes.post('/', async c => {
  const body = await c.req.json()
  const result = await createUser(c.env, body.username, body.password)
  return c.json(result)
})

export default userRoutes
