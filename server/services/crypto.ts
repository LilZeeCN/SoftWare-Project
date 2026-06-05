import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

/**
 * 从环境变量或默认值派生主密钥
 * 生产环境务必设置 ENCRYPTION_KEY 环境变量
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || 'mozhi-academy-default-encryption-key';
  return crypto.scryptSync(secret, 'mozhi-salt-v1', 32);
}

/** 使用 AES-256-GCM 加密明文 */
export function encrypt(plainText: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/** 使用 AES-256-GCM 解密密文 */
export function decrypt(cipherText: string): string {
  const key = getMasterKey();
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
