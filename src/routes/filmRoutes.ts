import { Hono } from 'hono'
import { Env } from '../types/env'

const filmRoutes = new Hono<{ Bindings: Env }>()


export default filmRoutes
