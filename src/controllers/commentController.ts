import { Env } from '../types/env'
import { query } from '../utils/db'


export const getComments = async (env: Env, filmId: number) => {
  return query(env.DB, 'SELECT * FROM comments WHERE film_id = ?1', [filmId])
}

export const addComment = async (env: Env, userId: number, filmId: number, content: string) => {
  await env.DB.prepare(
    'INSERT INTO comments (user_id, film_id, content) VALUES (?1, ?2, ?3)'
  ).bind(userId, filmId, content).run()
  return { message: 'Comment added' }
}
