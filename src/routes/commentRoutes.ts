import { Context, Hono } from 'hono'
import { getComments, addComment } from '../controllers/commentController'
import { Env } from '../types/env'

const commentRoutes = new Hono<{ Bindings: Env }>()

commentRoutes.get('/:filmId', async c => {
  const filmId = Number(c.req.param('filmId'))
  const comments = await getComments(c.env, filmId)
  return c.json(comments)
})

commentRoutes.post('/:filmId', async c => {
    
  const filmId = Number(c.req.param('filmId'))
  const body = await c.req.json()
  const result = await addComment(c.env, body.userId, filmId, body.content)
  return c.json(result)
})

export default commentRoutes
