/**
 * 实验内容生成提示词
 */

interface LabsContext {
  courseTitle: string;
  weekTopic: string;
  weekDescription: string;
  language?: string;
}

export function getLabsPrompt(ctx: LabsContext): {
  system: string;
  user: string;
} {
  return {
    system: `你是一位资深的计算机科学教育者，擅长设计动手编程实验。
你总是以 JSON 格式输出，严格遵循用户要求的格式。`,

    user: `请为以下课程主题设计一个编程实验。

课程名称：${ctx.courseTitle}
本周主题：${ctx.weekTopic}
主题描述：${ctx.weekDescription || '（无描述）'}
编程语言：${ctx.language || 'Python'}

请严格按以下 JSON 格式输出（不要添加任何 markdown 标记）：
{
  "title": "实验标题",
  "description": "实验简要描述",
  "instructions": "详细的实验步骤说明（Markdown 格式）",
  "starter_code": {
    "main.${ext(ctx.language)}": "// 在此编写你的代码"
  },
  "test_cases": [
    {
      "name": "测试用例名称",
      "input": "输入描述",
      "expected": "期望输出"
    }
  ]
}

要求：
1. 实验与本周主题紧密相关
2. 有明确的任务目标和验收标准
3. 提供有意义的起始代码框架
4. 包含 3-5 个测试用例`,
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
