// src/utils/auth.ts
import { sign, verify } from 'hono/jwt'

/**
 * 令牌过期时间（秒）
 * AccessToken: 1 天
 * RefreshToken: 30 天
 */
export enum Expiry {
  AccessToken = 60 * 60 * 24,      // 86400 秒 = 1 天
  RefreshToken = 60 * 60 * 24 * 30 // 2592000 秒 = 30 天
}

/**
 * 生成访问令牌（短期有效）
 * @param userId 用户 ID
 * @param secret JWT 密钥
 * @param expiresIn 有效期（默认 1 天）
 */
export const generateAccessToken = async (
  userId: number,
  secret: string,
  expiresIn: number = Expiry.AccessToken
): Promise<string> => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000)
  const exp = currentTimeInSeconds + expiresIn

  return await sign(
    {
      id: userId,
      type: 'access',
      exp: exp
    },
    secret,
    'HS256'
  )
}

/**
 * 生成刷新令牌（长期有效）
 * @param userId 用户 ID
 * @param secret JWT 密钥
 * @param expiresIn 有效期（默认 30 天）
 */
export const generateRefreshToken = async (
  userId: number,
  secret: string,
  expiresIn: number = Expiry.RefreshToken
): Promise<string> => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000)
  const exp = currentTimeInSeconds + expiresIn

  return await sign(
    {
      id: userId,
      type: 'refresh',
      exp: exp
    },
    secret,
    'HS256'
  )
}

/**
 * 校验并解析 JWT
 * @param token JWT 字符串
 * @param secret JWT 密钥
 */
export const verifyToken = async <T extends object>(
  token: string,
  secret: string
): Promise<T | null> => {
  try {
    return (await verify(token, secret, 'HS256')) as T
  } catch {
    return null
  }
}