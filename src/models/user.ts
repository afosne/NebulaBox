export interface User {
  id: number
  username: string
  password: string
  role: 'admin' | 'member' | 'vip'
  created_at: string
}
