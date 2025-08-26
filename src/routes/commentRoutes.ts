import { Hono } from 'hono'
import { Env } from '../types/env'

const commentRoutes = new Hono<{ Bindings: Env }>()

export default commentRoutes
