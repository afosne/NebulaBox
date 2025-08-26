import { Hono } from 'hono'
import { fetchCMSData } from '../controllers/cmsController'
import { KVCache } from '../utils/cache'
import { Env } from '../types/env'

const cmsRoutes = new Hono<{ Bindings: Env }>()

cmsRoutes.get('/', async c => {
  const cache = new KVCache(c.env.KV)
  const data = await fetchCMSData(cache, 'https://example.com/api/cms')
  return c.json(data)
})

export default cmsRoutes
