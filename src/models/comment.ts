export interface Comment {
  id: number
  film_id: number
  user_id: number
  content: string
  likes: number
  status: number // 0待审核 1通过 -1拒绝
  created_at: string
  updated_at: string
}
