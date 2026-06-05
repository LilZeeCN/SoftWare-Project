import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import './db';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import outlineRoutes from './routes/outline';
import reportRoutes from './routes/report';
import certificatesRoutes from './routes/certificates';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ========== 中间件 ==========

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// JWT 认证（/api/auth/* 路由会自动跳过）
app.use('/api', authMiddleware);

// ========== 路由 ==========

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/courses', outlineRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/settings', settingsRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== 生产环境静态文件 ==========

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ========== 启动 ==========

app.listen(PORT, () => {
  console.log(`🚀 墨智学堂 API 服务已启动 → http://localhost:${PORT}`);
});
