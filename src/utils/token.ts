import { sign } from 'hono/jwt'

export enum Expiry{
    AccessToken = 86400,
    RefreshToken = 2592000
}

// 生成访问令牌（短期有效）
export const generateAccessToken = async (
  userId: number,
  secret: string,
  expiresIn : number = Expiry.AccessToken
) => {
  // 计算过期时间（当前时间 + 有效期秒数）
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const exp: number = currentTimeInSeconds + expiresIn;
  
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
  userId: number,
  secret: string,
  expiresIn: number = Expiry.RefreshToken
) => {
  // 计算过期时间（当前时间 + 有效期秒数）
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const exp: number = currentTimeInSeconds + expiresIn;
  
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
