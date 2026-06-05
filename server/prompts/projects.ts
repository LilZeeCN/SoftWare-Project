/**
 * 项目内容生成提示词
 */

interface ProjectsContext {
  courseTitle: string;
  weekTopic: string;
  weekDescription: string;
  language?: string;
}

export function getProjectsPrompt(ctx: ProjectsContext): {
  system: string;
  user: string;
} {
  return {
    system: `你是一位资深的软件工程教育者，擅长设计循序渐进的编程项目。
你总是以 JSON 格式输出，严格遵循用户要求的格式。`,

    user: `请为以下课程主题设计一个编程项目。

课程名称：${ctx.courseTitle}
本周主题：${ctx.weekTopic}
主题描述：${ctx.weekDescription || '（无描述）'}
编程语言：${ctx.language || 'Python'}

请严格按以下 JSON 格式输出（不要添加任何 markdown 标记）：
{
  "title": "项目标题",
  "description": "项目简要描述和总体目标",
  "milestones": [
    {
      "order": 1,
      "title": "里程碑标题",
      "description": "里程碑详细描述",
      "tasks": ["任务1", "任务2", "任务3"]
    }
  ],
  "starter_code": {
    "main.${ext(ctx.language)}": "// 项目起始代码框架"
  }
}

要求：
1. 项目分为 3-5 个里程碑，逐步推进
2. 每个里程碑有明确的交付物
3. 项目与本周主题紧密相关
4. 起始代码提供合理的框架结构`,
  };
}

function ext(lang?: string): string {
  const map: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    java: 'java',
  };
  return map[lang?.toLowerCase() || 'python'] || 'py';
}
