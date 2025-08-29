
import { Context } from "hono"
import { getD1Database } from "../../types/env"
import { User } from "../../models/user"
import { hashPassword } from "../../utils/passwd";
import { ChangePasswordParams } from "../../services/user/changePassword";

/**
 * createUser 创建用户
 * @param c 
 * @param params 
 * @returns 创建的用户
 */
export async function createUser(c: Context, params: User) { 
  try { 
    const db = getD1Database(c);

    const avatar = params.avatar ? params.avatar : `https://api.dicebear.com/9.x/pixel-art/svg?seed=${params.username}`;
    const role = params.role ? params.role : 'member';
    const password = await hashPassword(params.password);
    const user = await db
        .prepare(`INSERT INTO users (username, password, email, avatar, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(params.username, password, params.email, avatar, role)
        .run();
    console.log("用户" + params.username + "创建"+ user);
    return user;
  } catch (error: any) { 
    console.error(error);
      if (error.message.includes("UNIQUE constraint failed: users.email")) {
            return {
                success: false,
                message: "用户邮箱已存在"
            };
      }else if (error.message.includes("UNIQUE constraint failed: users.username")) {
            return {
                success: false,
                message: "用户名已存在"
            };
      }
      return {
        success: false,
        message: error.message
      };
  }
}

/**
 * 查询用户ID
 * @param c
 * @param username
 * @returns 用户ID
 */
export async function getUserId(c: Context, username: string ) { 
    const db = getD1Database(c)
  
    const user = await db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .bind(username)
        .first();

    console.log("用户" + username + "查询"+ user);
    return Number(user?.id);
}

/**
 * 获取用户信息
 * @param c
 * @param 用户id 或者 用户名
 * @returns 用户信息
 */
export async function getUserInfo(c: Context, id: number): Promise<User | null> {
  // 1. 先校验用户 ID 合法性（原有逻辑保留）
  if (!id || id <= 0) {
    throw new Error('Invalid user ID: ID must be a positive number');
  }

  try {
    const db = getD1Database(c);
    // 2. 只查询需要的字段（避免 SELECT * 泄露敏感信息）
    const query = `
      SELECT id, username, password 
      FROM users 
      WHERE id = ?
    `;
    // 3. 执行查询，通过 as User 断言结果类型（需确保 SQL 返回字段与 User 接口一致）
    const user = await db.prepare(query)
      .bind(id)
      .first() as User | null; // 明确返回类型：User 或 null

    console.log(`用户查询结果（ID: ${id}）:`, user);
    return user;
  } catch (error) {
    // 4. 捕获数据库查询异常（如 SQL 语法错误、D1 连接失败）
    console.error('查询用户信息失败:', error);
    throw new Error('Failed to fetch user information');
  }
}

/**
 * 更新用户密码
 * @param c
 * @param username 用户名
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 */
export async function updateUserPassword(c: Context, params:ChangePasswordParams) { 
  try { 
    const db = getD1Database(c);
    const password = await hashPassword(params.newPassword);
    const user = await db
        .prepare(`UPDATE users SET password = ? WHERE username = ?`)
        .bind(password, params.username)
        .run();
    console.log("用户" + params.username + "更新密码"+ user);
    return user
  } catch (error: any) { 
    console.error(error);
    throw new Error('Failed to update user password');
  }
}