import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'mozhi-academy-jwt-secret-dev-only';

export interface AuthRequest extends Request {
  user?: { id: number };
}

/**
 * JWT 认证中间件
 * - 跳过 /api/auth/* 路由（登录、设置密码、状态检查）
 * - 其他 /api 路由必须携带有效 token
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  // req.path 已去掉 /api 前缀（因为 middleware 挂载在 /api）
  if (req.path.startsWith('/auth') || req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: '未提供认证令牌' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({ error: '认证令牌无效或已过期' });
  }
}

/** 生成 JWT token */
export function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}
