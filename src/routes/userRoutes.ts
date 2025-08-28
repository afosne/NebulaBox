import { Hono } from 'hono'
import { login } from '../services/user/login'
import { changePassword } from '../services/user/changePassword'
import { register } from '../services/user/register'

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

// 修改密码
userRoutes.post('/change-password', async c => {
  const { username, oldPassword, newPassword } = await c.req.json()
  const data = await changePassword(c, { username, oldPassword, newPassword })
  return c.json(data)
})

export default userRoutes
