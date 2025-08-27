
import { Context } from "hono"
import { getD1Database } from "../../types/env"
import { Membership } from "../../models/memberships";

// plan: number // 0 免费 1 测试会员 2 月付会员 3 季付会员 4 年付会员
export enum MembershipPlan {
    Free = 0,        // 免费
    Trial = 1,       // 测试会员
    Monthly = 2,     // 月付会员
    Quarterly = 3,   // 季付会员
    Yearly = 4       // 年付会员
}
// status: number // 0过期 1有效
export enum MembershipStatus{
    Expired = 0,
    Active = 1
}

export function getEndTime(plan: MembershipPlan): string {
    const now = new Date().getTime();

    switch (plan) {
        case MembershipPlan.Free:
            return new Date(now).toISOString();                           // 0天
        case MembershipPlan.Trial:
            return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7天
        case MembershipPlan.Monthly:
            return new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30天
        case MembershipPlan.Quarterly:
            return new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90天
        case MembershipPlan.Yearly:
            return new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString(); // 365天
    }
}

/**
 * createMembership 创建会员
 * @param c 
 * @param params 
 * @returns 创建的会员
 */
export async function createMembership(c: Context, params: Membership) { 
    const db = getD1Database(c)
    // 获取当前时间
    const plan = params.plan ? params.plan : MembershipPlan.Free
    const status = params.status ? params.status : MembershipStatus.Active
    const now = new Date().toISOString()
    const start_at = params.start_at ? params.start_at : now
    const end_at = params.end_at ? params.end_at : getEndTime(MembershipPlan.Free)
    const membership = 
    await db
    .prepare(`INSERT INTO memberships (user_id, plan, status, start_at, end_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(params.user_id, plan, status, start_at, end_at)
    .run()
    console.log("用户ID" + params.user_id+ "创建会员 "+ membership);
    return membership
}

