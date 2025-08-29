import { Context } from "hono";
import { getUserId, getUserInfo, updateUserPassword } from "../../controllers/user";
import { verifyPassword } from "../../utils/passwd";


export interface ChangePasswordParams {
  username: string
  oldPassword: string
  newPassword: string
}

export async function changePassword(c: Context, params: ChangePasswordParams) { 
    if(params.oldPassword === params.newPassword)
        return { success: false, message: '新密码不能与旧密码相同' }
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
    const isPasswordValid = await verifyPassword(user.password, params.oldPassword);  // 修正变量名
    if (!isPasswordValid) {
        return { success: false, message: '密码错误' };
    }
    // 更新密码
    const result = await updateUserPassword(c, params)
    if(!result.success){
        return { success: false, message: '密码更改失败' }
    }
    return { success: true, message: '密码更改成功' }

}