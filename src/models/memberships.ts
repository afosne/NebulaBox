export interface Membership {
  id: number
  user_id: number
  plan: string
  status: number // 0过期 1有效
  start_at: string
  end_at: string
  created_at: string
  updated_at: string
}

