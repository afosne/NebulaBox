import { sign } from 'hono/jwt'

// 生成访问令牌（短期有效）
export const generateAccessToken = async (
  userId: string | number,
  secret: string,
  expiresIn: number = 900 // 默认15分钟（秒）
) => {
  // 计算过期时间（当前时间 + 有效期秒数）
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  
  // 访问令牌 payload 包含必要的用户标识信息和过期时间
  return sign(
    {
      id: userId,
      type: 'access',         // 令牌类型标识
      exp                     // 过期时间（Unix时间戳，秒）
    },
    secret,
    'HS256' // 指定签名算法（可选，默认HS256）
  )
}

// 生成刷新令牌（长期有效）
export const generateRefreshToken = async (
  userId: string | number,
  secret: string,
  expiresIn: number = 2592000 // 默认30天（秒）
) => {
  // 计算过期时间（当前时间 + 有效期秒数）
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  
  // 刷新令牌 payload 应尽量精简
  return sign(
    {
      id: userId,
      type: 'refresh',        // 令牌类型标识
      exp                     // 过期时间（Unix时间戳，秒）
    },
    secret,
    'HS256' // 指定签名算法
  )
}
