import { Context } from "hono"
import { getD1Database } from "../../types/env"
import { User } from "../../models/user"
import { hashPassword } from "../../utils/pass";

// 定义查询用户的参数类型
type GetUserParams = {
  id?: string;
  username?: string;
  email?: string;
};

// 定义函数返回类型
type ServiceResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
};

/**
 * createUser 创建用户
 * @param c 
 * @param params 
 * @returns 创建的用户ID或错误信息
 */
export async function createUser(c: Context, params: User): Promise<ServiceResponse<{ id: number }>> { 
  try { 
    const db = getD1Database(c);

    const avatar = params.avatar ?? `https://api.dicebear.com/9.x/pixel-art/svg?seed=${params.username}`;
    const role = params.role ?? 'member';
    const password = await hashPassword(params.password);
    
    const result = await db
        .prepare(`INSERT INTO users (username, password, email, avatar, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(params.username, password, params.email, avatar, role)
        .run();

    // 检查插入是否成功
    if (result.success && result.meta?.last_row_id) {
      console.log(`用户 ${params.username} 创建成功，ID: ${result.meta.last_row_id}`);
      return {
        success: true,
        data: { id: result.meta.last_row_id }
      };
    }

    throw new Error("用户创建失败");
  } catch (error: any) { 
    console.error("创建用户失败:", error);
    
    if (error.message.includes("UNIQUE constraint failed: users.email")) {
      return { success: false, message: "用户邮箱已存在" };
    } else if (error.message.includes("UNIQUE constraint failed: users.username")) {
      return { success: false, message: "用户名已存在" };
    }
    
    return { success: false, message: error.message || "创建用户时发生错误" };
  }
}

/**
 * 查询用户ID
 * @param c
 * @param username 或 email
 * @returns 用户ID
 */
export async function getUserId(c: Context, { username, email }: { username?: string; email?: string }): Promise<number | null> { 
  if (!username && !email) {
    console.error("getUserId 缺少必要参数");
    return null;
  }

  try {
    const db = getD1Database(c);
    let user: { id: number } | null = null;

    if (username) {    
      user = await db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .bind(username)
        .first<{ id: number }>();
      console.log(`用户 ${username} 查询结果:`, user);
    } else if (email) {    
      user = await db
        .prepare(`SELECT id FROM users WHERE email = ?`)
        .bind(email)
        .first<{ id: number }>();
      console.log(`用户 ${email} 查询结果:`, user);
    }

    return user?.id || null;
  } catch (error) {
    console.error("查询用户ID失败:", error);
    return null;
  }
}

/**
 * 获取用户信息（不包含密码）
 * @param params 查询参数（id、username、email 三选一）
 * @returns 用户信息
 */
export async function getUserInfo(c: Context, params: GetUserParams): Promise<Omit<User, 'password'> | null> {
  const { id, username, email } = params;
  
  if (!id && !username && !email) {
    console.error("getUserInfo 缺少必要参数");
    throw new Error("请传入必要的参数（id、username 或 email）");
  }

  try {
    const db = getD1Database(c);
    let user: any = null;

    // 只查询需要的字段，排除密码
    const query = `
      SELECT id, username, email, avatar, role, created_at, updated_at 
      FROM users 
      WHERE 
        ${id ? 'id = ?' : username ? 'username = ?' : 'email = ?'}
    `;

    if (id) {
      user = await db.prepare(query).bind(id).first();
    } else if (username) {
      user = await db.prepare(query).bind(username).first();
    } else if (email) {
      user = await db.prepare(query).bind(email).first();
    }

    console.log("用户查询结果:", user);
    return user as Omit<User, 'password'> | null;
  } catch (error) {
    console.error("查询用户信息失败:", error);
    throw error; // 抛出错误让调用方处理
  }
}
