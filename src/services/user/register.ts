import { Context } from "hono"
import { User } from "../../models/user"
import { createUser, getUserId } from "../../controllers/user"
import { Membership } from "../../models/memberships"
import { createMembership, getEndTime, MembershipPlan, MembershipStatus } from "../../controllers/memberships"


interface RegisterParams {
  username: string
  password: string
  email: string
}

export async function register(c: Context, params: RegisterParams) { 
    const userParas: User = {
        username: params.username,
        password: params.password,
        email: params.email,
    }
    
    const user = await createUser(c, userParas)
    if (!user.success) {
        return { success: false, message: user.message }
    }

    const userId = await getUserId(c,  params.username)
    if (!userId) {
        return { success: false, message: '用户创建失败' }
    }

    const membership : Membership = {
        user_id: Number(userId),
        plan: MembershipPlan.Trial,
        status: MembershipStatus.Active,
        start_at: new Date().toISOString(),
        end_at: getEndTime(MembershipPlan.Trial),
    }

    const result =  await createMembership(c, membership)
    if(!result.success){
        return {success: false, message: '会员创建失败' }
    }
    return {success: true, message: '会员创建成功'}
}