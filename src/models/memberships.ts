export interface Membership {
  id?: number
  user_id: number
  plan: number // 0 免费 1 测试会员 2 月付会员 3 季付会员 4 年付会员
  status: number // 0过期 1有效
  start_at: string
  end_at: string
  created_at?: string
  updated_at?: string
}

