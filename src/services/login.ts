import { Context } from "hono"
import { getUserId, getUserInfo } from "../controllers/user"
import { generateAccessToken, generateRefreshToken } from "../utils/token"
import { verifyPassword } from "../utils/pass"

interface LoginParams {
    username?: string
    email?: string
    password: string
}

/**
 * 登录
 * @param c
 * @param params
 * @returns
 */
export async function login(c: Context, params: LoginParams) {
    const { username, email, password } = params
    const user = await getUserInfo(c, username, email)
    
    if (!user) {
        return { susccess: false, message: '用户不存在' }
    }
    const userid = await getUserId(c, username, email)
    
    // 验证密码是否在正确
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
        return { success: false, message: '密码错误' };
    }

    // 生成访问令牌（使用环境变量中的过期时间）
    const accessToken = await generateAccessToken(
        userid,
        c.env.JWT_SECRET,
        parseInt(c.env.ACCESS_TOKEN_EXPIRY) // 传入秒数
    )
    // 生成刷新令牌
    const refreshToken = await generateRefreshToken(
        userid,
        c.env.JWT_SECRET,
        parseInt(c.env.REFRESH_TOKEN_EXPIRY) // 传入秒数
    )
    return { success: true, id: userid, accessToken, refreshToken }
}