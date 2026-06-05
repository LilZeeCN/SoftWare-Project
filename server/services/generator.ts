/**
 * 两阶段内容生成器
 *
 * 使用 AI 服务 + 提示词模板生成课程内容：
 * - 大纲（syllabus）
 * - 实验（labs）
 * - 项目（projects）
 * - 笔记（notes）
 */

import { chat } from './ai';
import { getSyllabusPrompt } from '../prompts/syllabus';
import { getLabsPrompt } from '../prompts/labs';
import { getProjectsPrompt } from '../prompts/projects';
import { getNotesPrompt } from '../prompts/notes';
import { getLecturePrompt } from '../prompts/lecture';

/** 从 AI 回复中提取 JSON（兼容 markdown 代码块包裹） */
function extractJSON<T>(text: string): T {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }
  return JSON.parse(text);
}

/** 生成课程大纲 */
export async function generateSyllabus(context: {
  title: string;
  description: string;
  style: string;
  format: string;
  weeks?: number;
}) {
  const { system, user } = getSyllabusPrompt(context);
  const response = await chat(system, [{ role: 'user', content: user }]);
  return extractJSON<{ weeks: Array<{ week_number: number; topic: string; description: string }> }>(response);
}

/** 生成实验内容 */
export async function generateLab(context: {
  courseTitle: string;
  weekTopic: string;
  weekDescription: string;
  language?: string;
}) {
  const { system, user } = getLabsPrompt(context);
  const response = await chat(system, [{ role: 'user', content: user }]);
  return extractJSON(response);
}

/** 生成项目内容 */
export async function generateProject(context: {
  courseTitle: string;
  weekTopic: string;
  weekDescription: string;
  language?: string;
}) {
  const { system, user } = getProjectsPrompt(context);
  const response = await chat(system, [{ role: 'user', content: user }]);
  return extractJSON(response);
}

/** 生成讲义内容（完整版或预览版） */
export async function generateLecture(context: {
  courseTitle: string;
  courseDescription: string;
  weekNumber: number;
  weekTopic: string;
  weekDescription: string;
  style: string;
  mode: 'full' | 'preview';
}) {
  const { system, user } = getLecturePrompt(context);
  const response = await chat(system, [{ role: 'user', content: user }]);
  return extractJSON<{ sections: Array<{ title: string; content?: string; estimated_minutes?: number }> }>(response);
}

/** 生成学习笔记（返回 Markdown 文本，不是 JSON） */
export async function generateNotes(context: {
  courseTitle: string;
  weekTopic: string;
  weekDescription: string;
  existingNotes?: string;
}): Promise<string> {
  const { system, user } = getNotesPrompt(context);
  return await chat(system, [{ role: 'user', content: user }]);
}
