/**
 * 讲义内容生成提示词
 */

interface LectureContext {
  courseTitle: string;
  courseDescription: string;
  weekNumber: number;
  weekTopic: string;
  weekDescription: string;
  style: string;
  mode: 'full' | 'preview';
}

export function getLecturePrompt(ctx: LectureContext): {
  system: string;
  user: string;
} {
  const styleGuide = getStyleGuide(ctx.style);

  if (ctx.mode === 'preview') {
    return {
      system: '你是一位课程内容规划师。请为指定章节生成仅包含小节标题的预览大纲。',
      user: [
        `课程：${ctx.courseTitle}`,
        `第 ${ctx.weekNumber} 周 · ${ctx.weekTopic}`,
        `描述：${ctx.weekDescription}`,
        '',
        '请返回 JSON 格式的小节标题列表，每个小节只包含标题，不包含内容：',
        '{',
        '  "sections": [',
        '    { "title": "一、XXX", "estimated_minutes": 25 },',
        '    { "title": "二、XXX", "estimated_minutes": 30 }',
        '  ]',
        '}',
        '要求：4-6 个小节，标题简洁明了',
      ].join('\n'),
    };
  }

  return {
    system: [
      '你是一位资深课程讲师，擅长编写高质量的教学讲义。',
      styleGuide,
      '你总是以 JSON 格式输出。内容要详细、易懂，包含代码示例、类比和生活化解释。',
    ].join('\n'),
    user: [
      `请为以下课程章节编写完整的教学讲义。`,
      '',
      `课程名称：${ctx.courseTitle}`,
      `课程简介：${ctx.courseDescription}`,
      `第 ${ctx.weekNumber} 周 · 主题：${ctx.weekTopic}`,
      `主题描述：${ctx.weekDescription}`,
      '',
      '请严格按照以下 JSON 格式输出：',
      '{',
      '  "sections": [',
      '    {',
      '      "title": "一、核心概念",',
      '      "content": "详细的讲义内容..."',
      '    }',
      '  ]',
      '}',
      '',
      '要求：',
      '1. 包含 4-6 个小节',
      '2. 每个小节的内容要详细、有深度',
      '3. 适当加入代码示例（用 ``` 代码块包裹）',
      '4. 用 💡 高亮标注关键概念',
      '5. 用生活化类比帮助理解抽象概念',
      '6. 总字数 1500-3000 字',
    ].join('\n'),
  };
}

function getStyleGuide(style: string): string {
  const map: Record<string, string> = {
    minimal: '风格：清晰简洁，直击重点，减少冗余修饰',
    academic: '风格：正式严谨，术语准确，逻辑严密，适合理论学习',
    lively: '风格：生动有趣，多用类比和故事，适合入门学习者',
  };
  return map[style] || '风格：清晰易懂，循序渐进';
}
