/**
 * 生成密码哈希（兼容Cloudflare Workers环境）
 * @param password 明文密码
 * @returns 哈希后的密码字符串（格式：salt:hash）
 */
export async function hashPassword(password: string): Promise<string> {
  // 生成随机盐值（16字节）
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // 使用Web Crypto API计算SHA-256哈希（带盐值）
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    keyMaterial,
    salt
  );
  
  // 将盐值和哈希转换为十六进制字符串存储
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${hashHex}`;
}

/**
 * 验证密码（与hashPassword配套使用）
 * @param storedHash 存储的哈希字符串（格式：salt:hash）
 * @param inputPassword 输入的明文密码
 * @returns 密码是否匹配
 */
export async function verifyPassword(storedHash: string, inputPassword: string): Promise<boolean> {
  try {
    // 拆分盐值和哈希
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) return false;
    
    // 将盐值从十六进制转换为Uint8Array
    const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
    if (salt.length !== 16) return false; // 验证盐值长度
    
    // 计算输入密码的哈希
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(inputPassword),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      keyMaterial,
      salt
    );
    
    // 将计算出的哈希转换为十六进制
    const inputHashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 比较哈希值
    return inputHashHex === hashHex;
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}
