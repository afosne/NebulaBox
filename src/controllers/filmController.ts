import { Env } from '../types/env'
import { query } from '../utils/db'


export const getFilms = async (env: Env) => {
  return query(env.DB, 'SELECT * FROM films')
}
