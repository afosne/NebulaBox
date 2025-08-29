import { Context } from "hono"
import { getUserId, getUserInfo } from "../../controllers/user"
import { Expiry, generateAccessToken, generateRefreshToken } from "../../utils/token"
import { verifyPassword } from "../../utils/passwd"

interface LoginParams {
    username: string
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
    const username = params.username 
    const userid = await getUserId(c, username)
    if (!userid) {
        return { success: false, message: '用户不存在' }  // 修复拼写错误: susccess -> success
    }
    
    // 获取用户信息，包括密码
    const user = await getUserInfo(c, userid)
    if (!user) {
        return { success: false, message: '用户不存在' }
    }
    // 验证密码是否正确
    const isPasswordValid = await verifyPassword(user.password, params.password);  // 修正变量名
    if (!isPasswordValid) {
        return { success: false, message: '密码错误' };
    }

    // 生成访问令牌（使用环境变量中的过期时间）
    const accessToken = await generateAccessToken(
        userid,
        c.env.JWT_SECRET,
        Expiry.AccessToken
    )
    // 生成刷新令牌
    const refreshToken = await generateRefreshToken(
        userid,
        c.env.JWT_SECRET,
        Expiry.RefreshToken
    )

    return { success: true, id: userid, accessToken, refreshToken }
}