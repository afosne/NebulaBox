import { Hono } from 'hono'
import { getFilms } from '../controllers/filmController'
import { Env } from '../types/env'

const filmRoutes = new Hono<{ Bindings: Env }>()

filmRoutes.get('/', async c => {
  const films = await getFilms(c.env)
  return c.json(films)
})

export default filmRoutes
