/**
 * 笔记生成提示词
 */

interface NotesContext {
  courseTitle: string;
  weekTopic: string;
  weekDescription: string;
  existingNotes?: string;
}

export function getNotesPrompt(ctx: NotesContext): {
  system: string;
  user: string;
} {
  return {
    system: `你是一位优秀的学习笔记整理专家，擅长将课程内容转化为结构清晰、易于复习的学习笔记。
你的笔记风格：
- 使用 Markdown 格式
- 结构化组织（标题、列表、代码块、表格）
- 重点突出（加粗关键概念）
- 包含适当的示例和类比
- 适合作为考试复习材料`,

    user: `请为以下课程章节生成学习笔记。

课程名称：${ctx.courseTitle}
本周主题：${ctx.weekTopic}
主题描述：${ctx.weekDescription || '（无描述）'}
${ctx.existingNotes ? `\n已有笔记（请在此基础上扩展和完善）：\n${ctx.existingNotes}\n` : ''}

请生成一份完整的学习笔记，包含：
1. 本章概述（2-3 句话总结）
2. 核心概念（列出并解释关键概念）
3. 详细内容（按逻辑顺序展开）
4. 代码示例（如果适用）
5. 常见问题与陷阱
6. 总结要点

直接输出 Markdown 格式的笔记内容，不要添加额外说明。`,
  };
}
