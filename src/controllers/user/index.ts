
import { Context } from "hono"
import { getD1Database } from "../../types/env"
import { User } from "../../models/user"

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
    
    const user = await db
        .prepare(`INSERT INTO users (username, password, email, avatar, role) VALUES (?, ?, ?, ?, ?)`)
        .bind(params.username, params.password, params.email, avatar, role)
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
export async function getUserId(c: Context, username: string) { 
    const db = getD1Database(c)
    const user = await db
        .prepare(`SELECT id FROM users WHERE username = ?`)
        .bind(username)
        .first();
    console.log("用户" + username + "查询"+ user);
    return user?.id;
}