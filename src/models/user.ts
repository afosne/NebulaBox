export interface User {
  id?: number
  username: string
  password: string
  email?: string
  avatar?: string
  role?: 'admin' | 'member' | 'vip'
  created_at?: string
  updated_at?: string
}

