import { KVCache } from '../utils/cache'

export const fetchCMSData = async (cache: KVCache, url: string) => {
  const cacheKey = `cms:${url}`
  const cached = await cache.get<any>(cacheKey)
  if (cached) return cached

  const res = await fetch(url)
  const data = await res.json()
  await cache.set(cacheKey, data, 300)
  return data
}
// cms 采集数据流程
