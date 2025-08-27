import { Context, Next } from 'hono'
import { sign, verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';


//访问令牌
export const authAccessMiddleware = async (c: Context, next: Next) => {
  try {

    // 步骤2：校验 Authorization 头
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ message: '未提供有效的 Bearer 令牌' }, 401);
    }

    // 步骤3：提取并验证 Refresh Token
    const refreshToken = authHeader.split('Bearer ')[1].trim();
    if (!refreshToken) {
      return c.json({ message: '令牌格式不正确（Bearer 后无内容）' }, 401);
    }
    const JWT_SECRET = c.env.JWT_SECRET;
    // 步骤4：验证令牌（自动校验签名、exp 过期时间）
    const payload = verify(refreshToken, JWT_SECRET) as
      {
        id: string | number;
        type: string;
        exp: number;
      };

    // 步骤5：校验令牌类型（必须是 access ）
    if (payload.type !== 'access') {
      return c.json({ message: '无效的令牌类型，需使用 Refresh Token' }, 401);
    }

    // 步骤6：存储用户 ID 到上下文（直接存 ID，简化后续使用）
    c.set('userId', payload.id);
    await next();

  } catch (error) {
    // 捕获并区分验证异常
    if (error instanceof TokenExpiredError) {
      return c.json({ message: 'Refresh Token 已过期，请重新登录' }, 401);
    }
    if (error instanceof JsonWebTokenError) {
      return c.json({ message: '令牌验证失败（签名错误或格式无效）' }, 401);
    }
    // 其他未知错误（如环境变量缺失）
    console.error('Refresh Token 中间件错误:', error);
    return c.json({ message: '服务器认证异常' }, 500);
  }
};


// 刷新令牌只允许走刷新令牌获取访问令牌
export const authRefreshMiddleware = async (c: Context, next: Next) => {
  try {
    // 步骤1：校验环境变量


    // 步骤2：校验 Authorization 头
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ message: '未提供有效的 Bearer 令牌' }, 401);
    }

    // 步骤3：提取并验证 Refresh Token
    const refreshToken = authHeader.split('Bearer ')[1].trim();
    if (!refreshToken) {
      return c.json({ message: '令牌格式不正确（Bearer 后无内容）' }, 401);
    }
    const JWT_SECRET = c.env.JWT_SECRET;
    // 步骤4：验证令牌（自动校验签名、exp 过期时间）
    const payload = verify(refreshToken, JWT_SECRET) as
      {
        id: string | number;
        type: string;
        exp: number;
      };

    // 步骤5：校验令牌类型（必须是 refresh）
    if (payload.type !== 'refresh') {
      return c.json({ message: '无效的令牌类型，需使用 Refresh Token' }, 401);
    }

    // 步骤6：存储用户 ID 到上下文（直接存 ID，简化后续使用）
    c.set('userId', payload.id);
    await next();

  } catch (error) {
    // 捕获并区分验证异常
    if (error instanceof TokenExpiredError) {
      return c.json({ message: 'Refresh Token 已过期，请重新登录' }, 401);
    }
    if (error instanceof JsonWebTokenError) {
      return c.json({ message: '令牌验证失败（签名错误或格式无效）' }, 401);
    }
    // 其他未知错误（如环境变量缺失）
    console.error('Refresh Token 中间件错误:', error);
    return c.json({ message: '服务器认证异常' }, 500);
  }
};