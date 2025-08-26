import { Env } from '../types/env'
import { query } from '../utils/db'


export const getUsers = async (env: Env) => {
  return query(env.DB, 'SELECT * FROM users')
}

export const createUser = async (env: Env, username: string, password: string) => {
  await env.DB.prepare(
    'INSERT INTO users (username, password, role) VALUES (?1, ?2, ?3)'
  ).bind(username, password, 'member').run()
  return { message: 'User created' }
}
