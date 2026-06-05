import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/report - 获取学习报告数据（全部从数据库读取，无假数据）
router.get('/', (_req: AuthRequest, res: Response) => {
  // 统计：总学习章节数（已完成的 lecture_progress）
  const totalChapters = db.prepare(
    "SELECT COUNT(*) as count FROM lecture_progress WHERE status = 'completed'"
  ).get() as { count: number };

  // 统计：总学习时长（分钟）
  const totalDuration = db.prepare(
    'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM learning_sessions'
  ).get() as { total: number };

  // 统计：已完成实验数
  const completedLabs = db.prepare(
    "SELECT COUNT(*) as count FROM labs WHERE id IN (SELECT DISTINCT course_id FROM learning_sessions)"
  ).get() as { count: number };

  // 统计：已获得证书数
  const certificates = db.prepare(
    'SELECT COUNT(*) as count FROM certificates'
  ).get() as { count: number };

  // 统计：AI 问答次数
  const aiQueries = db.prepare(
    "SELECT COUNT(*) as count FROM messages WHERE role = 'user'"
  ).get() as { count: number };

  // 统计：本周学习天数（最近7天）
  const streakDays = db.prepare(`
    SELECT COUNT(DISTINCT date(started_at)) as count
    FROM learning_sessions
    WHERE started_at >= datetime('now', '-7 days')
  `).get() as { count: number };

  // 本周学习时长分布（从 learning_sessions 按天聚合）
  const weeklyRaw = db.prepare(`
    SELECT CAST(strftime('%w', started_at) AS INTEGER) as day_of_week,
           ROUND(SUM(COALESCE(duration_minutes, 0)) / 60.0, 1) as hours
    FROM learning_sessions
    WHERE started_at >= datetime('now', '-7 days')
    GROUP BY day_of_week
    ORDER BY day_of_week
  `).all() as Array<{ day_of_week: number; hours: number }>;

  const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weeklyHours = DAY_NAMES.map((day, i) => {
    const found = weeklyRaw.find((r) => r.day_of_week === i);
    return { day, hours: found ? found.hours : 0 };
  });

  // 课程完成进度（从 syllabus 表计算真实进度）
  const courses = db.prepare('SELECT id, title FROM courses ORDER BY created_at DESC').all() as Array<Record<string, unknown>>;
  const colors = ['var(--gold)', 'var(--jade)', 'var(--accent-purple)', 'var(--warning)', 'var(--accent-blue)'];
  const courseProgress = courses.map((c: Record<string, unknown>, i: number) => {
    const syllabusCount = db.prepare(
      'SELECT COUNT(*) as count FROM syllabus WHERE course_id = ?'
    ).get(c.id) as { count: number };
    const completedCount = db.prepare(
      "SELECT COUNT(*) as count FROM syllabus WHERE course_id = ? AND status = 'done'"
    ).get(c.id) as { count: number };
    const progress = syllabusCount.count > 0
      ? Math.round((completedCount.count / syllabusCount.count) * 100)
      : 0;
    return { name: c.title, progress, color: colors[i % colors.length] };
  });

  // 最近学习记录（从 learning_sessions 取真实记录）
  const recentRaw = db.prepare(`
    SELECT ls.started_at, ls.duration_minutes, ls.activity_type,
           COALESCE(c.title, '') as course_title
    FROM learning_sessions ls
    LEFT JOIN courses c ON ls.course_id = c.id
    ORDER BY ls.started_at DESC
    LIMIT 10
  `).all() as Array<{ started_at: string; duration_minutes: number; activity_type: string; course_title: string }>;

  const recentRecords = recentRaw.map((r) => ({
    date: r.started_at.slice(0, 10),
    content: r.activity_type || r.course_title || '学习活动',
    duration: `${Math.round((r.duration_minutes || 0) / 6) / 10}h`,
    status: 'completed' as const,
  }));

  res.json({
    stats: {
      totalChapters: totalChapters.count,
      totalHours: Math.round((totalDuration.total / 60) * 10) / 10,
      completedLabs: completedLabs.count,
      certificates: certificates.count,
      aiQueries: aiQueries.count,
      streakDays: streakDays.count,
    },
    weeklyHours,
    courseProgress,
    recentRecords,
  });
});

export default router;
