import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/setup — 首次设置密码
router.post('/setup', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 4) {
    res.status(400).json({ error: '密码至少需要 4 个字符' });
    return;
  }

  const existing = db
    .prepare('SELECT id FROM auth_config WHERE id = 1')
    .get() as Record<string, unknown> | undefined;

  if (existing) {
    res.status(400).json({ error: '密码已经设置过了' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(
    'INSERT INTO auth_config (id, password_hash) VALUES (1, ?)',
  ).run(passwordHash);

  const token = generateToken(1);
  res.json({ token });
});

// POST /api/auth/login — 登录
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: '请输入密码' });
    return;
  }

  const row = db
    .prepare('SELECT password_hash FROM auth_config WHERE id = 1')
    .get() as Record<string, string> | undefined;

  if (!row) {
    res.status(400).json({ error: '请先设置密码' });
    return;
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: '密码错误' });
    return;
  }

  const token = generateToken(1);
  res.json({ token });
});

// GET /api/auth/status — 检查认证状态
router.get('/status', (_req: Request, res: Response) => {
  const row = db.prepare('SELECT id FROM auth_config WHERE id = 1').get();
  res.json({ setup: !!row });
});

export default router;
