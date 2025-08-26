export interface Film {
  id: number
  title: string
  web: number // 0未知 1爱奇艺 2腾讯 3优酷 4芒果
  category_id: number
  cover_url?: string
  description?: string
  source_url: string
  created_at: string
  updated_at: string
}
