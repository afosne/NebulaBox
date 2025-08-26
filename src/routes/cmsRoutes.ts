import { Hono } from 'hono'
import { Env } from '../types/env'

const cmsRoutes = new Hono<{ Bindings: Env }>()

export default cmsRoutes
