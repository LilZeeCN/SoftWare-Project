/**
 * 课程大纲生成提示词
 */

interface SyllabusContext {
  title: string;
  description: string;
  style: string;
  format: string;
  weeks?: number;
}

export function getSyllabusPrompt(ctx: SyllabusContext): {
  system: string;
  user: string;
} {
  const weekCount = ctx.weeks || 12;

  return {
    system: `你是一位资深的课程设计专家，擅长设计结构清晰、循序渐进的课程大纲。
你总是以 JSON 格式输出，严格遵循用户要求的格式。`,

    user: `请为以下课程设计一个 ${weekCount} 周的教学大纲。

课程名称：${ctx.title}
课程描述：${ctx.description || '（无描述）'}
教学风格：${styleLabel(ctx.style)}
课程格式：${formatLabel(ctx.format)}

请严格按以下 JSON 格式输出（不要添加任何 markdown 标记）：
{
  "weeks": [
    {
      "week_number": 1,
      "topic": "本周主题",
      "description": "本周学习内容的简要描述，包含关键知识点"
    }
  ]
}

要求：
1. 内容循序渐进，从基础到高级
2. 每周主题明确，描述具体
3. 风格与"${styleLabel(ctx.style)}"一致
4. 总共 ${weekCount} 周`,
  };
}

function styleLabel(style: string): string {
  const map: Record<string, string> = {
    academic: '学术严谨',
    casual: '轻松易懂',
    interactive: '互动实践',
    'project-based': '项目驱动',
  };
  return map[style] || style;
}

function formatLabel(format: string): string {
  const map: Record<string, string> = {
    cs61b: 'CS61B 风格（每周主题 + 编程实践）',
    standard: '标准大学课程（理论 + 作业）',
  };
  return map[format] || format;
}
