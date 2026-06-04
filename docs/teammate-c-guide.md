# 📋 队友 C 开发指南

> 本文档是你的完整开发手册。按照顺序完成每个任务，遇到问题随时在群里问。

---

## 你的角色

你负责 **交互型页面** 的前端 + 对应后端 API。这些页面的特点是：涉及 AI 流式对话、代码编辑器、文件操作等复杂交互。难度比队友 B 的任务高一些，但也更有意思。

---

## 前置准备

### 等待 Zee 完成「项目骨架」后才能开始

与队友 B 相同，Zee 会先搭建好项目结构。

**收到 Zee 的通知后**，执行：

```bash
# 1. 克隆仓库
git clone https://github.com/LilZeeCN/SoftWare-Project.git
cd SoftWare-Project

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# 浏览器打开 http://localhost:3000 能看到页面就说明 OK

# 4. 创建你的开发分支
git checkout -b feat/pages-interactive-C
```

### 项目结构速览

```
server/routes/          ← 你要写的后端 API
  ├── settings.ts         你的
  ├── chat.ts             你的
  ├── notes.ts            你的
  ├── labs.ts             你的
  └── projects.ts         你的

src/components/          ← 你要写的前端组件
  ├── settings/           你的
  ├── course-detail/
  │   ├── notes/          你的
  │   ├── chat/           你的
  │   ├── labs/           你的
  │   └── projects/       你的

src/hooks/               ← Zee 写好，你调用
  ├── useStreamChat.ts    SSE 流式聊天 hook
  └── useCodeExecution.ts 代码执行 hook

src/globals.css          ← 只追加，不改已有内容
src/types/index.ts       ← 只追加类型
```

---

## 你的 5 个任务

### 任务 1：Settings 设置页

**开始时间**：Zee 完成项目骨架后（第 1 周后半段）

**参考 UI**：打开 `demo.html`，搜索 `<!-- ===== SETTINGS =====`（约第 2418 行）

**为什么先做这个**：这个页面最简单，帮你熟悉项目结构和开发流程。而且它配置 API Key，后续 AI 功能都需要先配好 Key。

**要写的文件**：

| 文件 | 说明 |
|------|------|
| `src/components/settings/SettingsPage.tsx` | 设置页面 |
| `server/routes/settings.ts` | 设置 API（替换 Zee 的骨架） |

**页面内容**（对照 demo.html）：

1. **模型配置** 区块：
   - **API Key**：密文显示 `sk-···`，点击"显示"按钮切换明文
   - **模型选择**：下拉框（GPT-4o / Claude 3.5 Sonnet / 自定义等）
   - **端点地址**：文本输入框（默认 `https://api.example.com/v1`）
2. **学习偏好** 区块：
   - **语言**：下拉框
   - **每日学习提醒**：下拉框
   - **讲义默认风格**：下拉框
3. **操作按钮**：恢复默认 / 保存配置

**后端 API**：

```typescript
// GET /api/settings            → 返回设置（API Key 用掩码）
//   返回格式: { apiKey: "sk-********", model: "Claude 3.5 Sonnet", endpoint: "...", ... }
// PUT /api/settings            → 更新设置
//   请求格式: { apiKey: "sk-xxx", model: "GPT-4o", endpoint: "...", language: "简体中文", ... }
```

**注意事项**：
- API Key 在后端使用 AES-256-GCM 加密存储（Zee 已在 `server/services/crypto.ts` 中实现）
- 前端永远不要明文显示完整的 API Key，只在"显示"按钮按下时临时展示

**测试方法**：

```bash
# 启动开发服务器
npm run dev

# 1. 测试 API
curl http://localhost:3001/api/settings
# 应返回默认设置（apiKey 为掩码）

curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"sk-test123","model":"GPT-4o","endpoint":"https://api.openai.com/v1"}'
# 应返回成功

# 2. 浏览器测试 http://localhost:3000/settings
# 检查点：
# □ API Key 默认显示为 sk-········
# □ 点击"显示"按钮后显示完整 Key
# □ 下拉框选择正常
# □ 点击"保存配置"显示成功提示（Toast）
# □ 刷新页面后设置保持（已存入数据库）
# □ 点击"恢复默认"重置所有选项
```

**验收标准**：
- [ ] 所有表单控件可正常交互
- [ ] 保存后数据持久化（刷新不丢失）
- [ ] API Key 密文/明文切换正常
- [ ] 视觉与 demo.html 一致

---

### 任务 2：Notes 笔记 Tab

**开始时间**：任务 1 完成后 + Zee 完成 AI 内容生成（任务 ⑥）

**参考 UI**：打开 `demo.html`，搜索 `<!-- TAB: 笔记`（约第 1666 行）

**要写的文件**：

| 文件 | 说明 |
|------|------|
| `src/components/course-detail/notes/NotesTab.tsx` | 笔记页面（侧边栏 + 编辑器） |
| `server/routes/notes.ts` | 笔记 CRUD + AI 生成 |

**页面布局**（对照 demo.html）：

```
┌─────────────────────────────────────────┐
│ 学习笔记              🤖 AI 生成笔记  ＋ 新建 │  ← 工具栏
├──────────┬──────────────────────────────┤
│ 学习章节  │  📖 第 7 章 · 面向对象 — 笔记   │
│          │                    📥 导出 ✏️ 编辑│
│ ▸ 第7章 ● │ ─────────────────────────────── │
│   第6章   │ 一、面向对象核心概念              │
│   第5章   │ 类（Class）是对象的蓝图...        │
│   第4章   │ 💡 核心区别：类是抽象概念...      │
│          │ 二、三大特性                      │
│          │ 封装、继承、多态...               │
└──────────┴──────────────────────────────┘
```

**功能清单**：

1. **左侧边栏**：列出各章节，点击切换笔记内容
2. **右侧内容区**：显示当前章节的笔记内容（支持标题、段落、代码、高亮框）
3. **"🤖 AI 生成笔记"按钮**：调用后端 API，AI 根据课程讲义内容自动生成笔记
4. **"📥 导出"按钮**：将笔记导出为 `.md` 文件（前端实现即可）
5. **"✏️ 编辑"按钮**：进入编辑模式（可以先用简单的 textarea，不需要富文本编辑器）

**后端 API**：

```typescript
// GET /api/courses/:id/notes           → 获取所有章节笔记列表
// GET /api/courses/:id/notes/:weekNum  → 获取指定章节的笔记内容
// PUT /api/courses/:id/notes/:weekNum  → 更新笔记内容
// POST /api/courses/:id/notes/generate → AI 生成当前章节笔记（返回笔记内容）
```

**测试方法**：

```bash
# 浏览器打开课程详情 → 点击"笔记" Tab
# 检查点：
# □ 左侧边栏显示章节列表
# □ 点击章节切换右侧内容
# □ 当前选中章节有金色左边框 + 背景
# □ 点击"AI 生成笔记"：显示 loading → 笔记内容更新
# □ 笔记内容包含：标题、段落、高亮框、代码块
# □ 点击"导出"：下载 .md 文件
# □ 点击"编辑"：进入编辑模式（textarea）
```

**验收标准**：
- [ ] 左右布局与 demo.html 一致
- [ ] 章节切换正常
- [ ] AI 生成笔记功能正常（需要先在 Settings 配置 API Key）
- [ ] 笔记内容样式正确（标题金色、代码等宽字体、高亮框左边框）

---

### 任务 3：AI Chat 对话 Tab

**开始时间**：Zee 完成 SSE 流式传输（任务 ⑤）后

**参考 UI**：打开 `demo.html`，搜索 `<!-- TAB: 对话`（约第 1963 行）

**这是你最重要的任务**。AI 对话是这个平台的核心功能。

**要写的文件**：

| 文件 | 说明 |
|------|------|
| `src/components/course-detail/chat/ChatTab.tsx` | 聊天页面（模式切换 + 消息列表 + 输入栏） |
| `server/routes/chat.ts` | 聊天 API（SSE 流式响应） |

**页面布局**：

```
┌──────────────────────────────────────────┐
│ 📖 章节问答  💬 通用问答  ＋ 新建对话      │  ← 模式切换按钮
├──────────────────────────────────────────┤
│ 📖 章节问答 · Python 核心编程  第7章 OO  │  ← 聊天头部
│                                  清空对话 │
├──────────────────────────────────────────┤
│                                          │
│ 🤖 你好！我是你的 AI 学习导师...          │  ← AI 消息（左对齐）
│                                          │
│           能帮我解释类和对象的区别吗？ 👤 │  ← 用户消息（右对齐）
│                                          │
│ 🤖 当然可以！让我们用生活中的类比...      │  ← AI 回复（流式逐字出现）
│   类是"建筑设计图"...                     │
│                                          │
├──────────────────────────────────────────┤
│ 输入你的问题……                         [→]│  ← 输入栏
└──────────────────────────────────────────┘
```

**核心功能**：

1. **模式切换**：
   - 📖 章节问答：AI 基于当前课程章节内容回答
   - 💬 通用问答：AI 自由回答任何问题
   - ＋ 新建对话：清空历史，开始新会话

2. **消息列表**：
   - AI 消息：左对齐，头像 🤖，金色背景头像
   - 用户消息：右对齐，头像 👤，翡翠色背景头像
   - 每条消息下方显示时间

3. **流式回复**（重点！）：
   - 用户发送消息后，AI 回复逐字显示（类似 ChatGPT 的打字效果）
   - 使用 Zee 提供的 `useStreamChat` hook：

   ```typescript
   import { useStreamChat } from '@/hooks/useStreamChat';

   const { messages, sendMessage, isStreaming } = useStreamChat({
     courseId: course.id,
     topicId: currentTopicId,
   });

   // 发送消息
   await sendMessage('能解释一下 Python 的装饰器吗？');

   // messages 会实时更新，包含流式内容
   ```

4. **输入栏**：
   - 文本输入框 + 发送按钮
   - 按 Enter 发送
   - 流式回复期间禁用发送

**后端 API**（`server/routes/chat.ts`）：

```typescript
// GET /api/courses/:id/topics         → 获取对话主题列表
// POST /api/courses/:id/topics        → 创建新对话主题
// GET /api/chat/topics/:id/messages   → 获取历史消息
// POST /api/chat                      → 发送消息（SSE 流式响应）
//   请求: { topicId: "uuid", message: "用户消息" }
//   响应: SSE 流
//     data: {"type":"chunk","content":"当"}
//     data: {"type":"chunk","content":"然"}
//     data: {"type":"done"}
```

**测试方法**：

```bash
# 前提：先在 Settings 配置好 API Key！
# 浏览器打开课程详情 → 点击"对话" Tab

# 检查点：
# □ 显示模式切换按钮（章节问答 / 通用问答 / 新建对话）
# □ 有初始 AI 欢迎消息
# □ 输入消息 → 点击发送/Enter → AI 回复逐字出现
# □ AI 消息左对齐（金色头像），用户消息右对齐（翡翠头像）
# □ 流式回复期间发送按钮禁用
# □ 切换"章节问答/通用问答"模式，标题和徽章文字变化
# □ 点击"新建对话"清空消息
# □ 点击"清空对话"清空消息
# □ 消息有时间戳
# □ 刷新页面后历史消息仍然显示（从 API 加载）
```

**验收标准**：
- [ ] 流式对话正常工作（逐字显示，不是一次性出现）
- [ ] 消息气泡样式与 demo.html 一致（圆角、颜色、对齐）
- [ ] 模式切换功能正常
- [ ] 历史消息持久化
- [ ] 空消息不能发送

---

### 任务 4：Labs 实验 Tab

**开始时间**：Zee 完成代码执行沙箱（任务 ⑦）后

**参考 UI**：打开 `demo.html`，搜索 `<!-- TAB: 实验`（约第 1728 行），包含实验列表和全屏编辑器两个视图。

**这是技术难度最高的任务。**

**要写的文件**：

| 文件 | 说明 |
|------|------|
| `src/components/course-detail/labs/LabsTab.tsx` | 实验主页面（列表视图 + 编辑器视图切换） |
| `server/routes/labs.ts` | 实验 CRUD API |

**两个视图**：

**视图 A — 实验列表**（默认）：
```
┌───────────────────────────────────────┐
│ ＋ 新建实验                            │
│                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│ │🐍 Lab 3  │ │🤖 Lab 4  │ │🌐 Lab 2  │  │
│ │学生成绩  │ │线性回归  │ │React组件│  │
│ │管理系统  │ │实战      │ │开发      │  │
│ │进行中    │ │未开始    │ │已完成    │  │
│ └─────────┘ └─────────┘ └─────────┘  │
└───────────────────────────────────────┘
```

点击卡片 → 切换到 **视图 B — 全屏编辑器**：

```
┌──────────────────────────────────────────────────────┐
│ ← │ 收起 │                    │ main.py      PY     │
├──────────┬───────────────────────────────────────────┤
│ 实验说明  │ 📁 lab3                                  │
│          │   📂 src                                  │
│ 1. 创建  │     main.py ●                             │
│    Student│     models.py                             │
│ 2. 实现  │     utils.py                              │
│    add   │   📂 tests                                │
│ 3. 创建  │   README.md                               │
│    Grade │                                           │
│          │  1 │ # 学生成绩管理系统                    │
│ 💡 参考  │  2 │ class Student:                       │
│ 提示     │  3 │     def __init__(self, name):         │
│          │  4 │         self.name = name              │
├──────────┴───────────────────────────────────────────┤
│ 终端                                                  │
│ ❯ ~/lab3 python main.py                              │
│ 排名： ['Alice', 'Bob']                               │
│ 不及格： ['Bob']                                      │
│ ❯ ~/lab3 _                                           │
├──────────────────────────────────────────────────────┤
│ 🤖 AI 助教  ✨ AI 修改  │     ▶ 运行测试  提交AI审查 │
└────────────────────────────────────────────────────────┘
```

**功能清单**：

1. **实验列表**：卡片网格，显示实验名称、描述、状态、难度、预计时长
2. **全屏编辑器**（点击实验卡片进入）：
   - 左侧：实验说明面板（可折叠）
   - 右侧上方：文件树 + 代码编辑器（**使用 Monaco Editor**）
   - 右侧下方：终端输出面板（显示代码运行结果，不是交互式终端）
   - 底部操作栏：
     - **▶ 运行本地测试**：调用代码执行 API，在输出面板显示结果
     - **提交给 AI 审查**：将代码发送给 AI，流式返回审查意见
     - **🤖 AI 助教**：打开侧边 AI 对话
3. **ESC 键**退出全屏，返回列表

**代码编辑器集成**：

```typescript
// 使用 Monaco Editor（已安装 @monaco-editor/react）
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  language="python"
  theme="vs-dark"
  value={code}
  onChange={(value) => setCode(value || '')}
  options={{
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  }}
/>
```

**代码执行**（使用 Zee 提供的 hook）：

```typescript
import { useCodeExecution } from '@/hooks/useCodeExecution';

const { execute, output, isRunning } = useCodeExecution();

// 点击"运行"按钮
await execute({
  files: { 'main.py': code, 'models.py': modelsCode },
  command: 'python main.py',
});

// output 会自动更新为运行结果
```

**后端 API**：

```typescript
// GET /api/courses/:id/labs              → 获取实验列表
// GET /api/courses/:id/labs/:labId       → 获取实验详情 + 文件
// PUT /api/courses/:id/labs/:labId/files  → 保存代码文件
// POST /api/courses/:id/labs/:labId/run   → 执行代码
//   返回: { stdout: "...", stderr: "...", exitCode: 0 }
```

**测试方法**：

```bash
# 浏览器打开课程详情 → 点击"实验" Tab

# 列表视图检查点：
# □ 实验卡片正确渲染（名称、状态标签、难度）
# □ 点击卡片进入全屏编辑器视图
# □ 点击"新建实验"按钮

# 编辑器视图检查点：
# □ 左侧实验说明面板显示步骤
# □ 文件树可以点击切换文件
# □ Monaco 编辑器显示代码，有语法高亮
# □ 点击"运行"→ 终端面板显示输出
# □ 代码有语法错误时 → 终端显示红色错误信息
# □ 点击"提交 AI 审查"→ 显示 AI 反馈
# □ 点击"收起"→ 说明面板折叠
# □ 按 ESC → 退出全屏，回到列表
```

**验收标准**：
- [ ] 列表 ↔ 编辑器视图切换流畅
- [ ] Monaco 编辑器正常工作（语法高亮、编辑）
- [ ] 代码执行返回正确结果
- [ ] 终端输出面板样式与 demo.html 一致
- [ ] 全屏模式正常工作

---

### 任务 5：Projects 项目 Tab

**开始时间**：任务 4 完成后（复用 Lab 编辑器的布局和组件）

**参考 UI**：打开 `demo.html`，搜索 `<!-- TAB: 项目`（约第 2020 行）

**要写的文件**：

| 文件 | 说明 |
|------|------|
| `src/components/course-detail/projects/ProjectsTab.tsx` | 项目页面 |
| `server/routes/projects.ts` | 项目 CRUD API |

**三个视图**：

1. **项目列表**：卡片 + 进度条
2. **里程碑列表**：展示各里程碑的状态（已完成/进行中/未开始），点击进入编辑器
3. **全屏编辑器**：**完全复用 Lab 的编辑器布局**（说明面板 + Monaco + 输出面板 + 操作栏）

**后端 API**：

```typescript
// GET /api/courses/:id/projects           → 获取项目列表
// GET /api/courses/:id/projects/:projId   → 获取项目详情 + 里程碑
// PUT /api/courses/:id/projects/:projId/milestones/:msId → 更新里程碑状态
```

**测试方法**：

```bash
# 浏览器打开课程详情 → 点击"项目" Tab

# 检查点：
# □ 项目卡片显示名称、描述、进度条
# □ 点击项目 → 显示里程碑列表
# □ 里程碑区分已完成/进行中/未开始状态
# □ 点击里程碑 → 进入全屏编辑器（与 Lab 布局一致）
# □ 编辑器功能正常（运行、AI 审查）
# □ 返回按钮 → 回到里程碑列表
# □ 再返回 → 回到项目列表
```

**验收标准**：
- [ ] 三层视图切换正常（列表 → 里程碑 → 编辑器）
- [ ] 里程碑状态正确显示
- [ ] 编辑器复用 Lab 组件，功能一致

---

## 你的开发时间线

```
Week 1 后半              Week 2                   Week 3
────────────────────────────────────────────────────────
任务1: Settings          任务3: AI Chat            任务5: Projects
   ↓ (等 Zee ⑤⑥)         ↓ (等 Zee ⑤)             ↓ (复用任务4)
任务2: Notes             任务4: Labs
                           ↑ (等 Zee ⑦)
```

**⚠️ 重要提示**：
- 任务 2 需要等 Zee 完成内容生成服务（AI 生成笔记才能用）
- 任务 3 需要等 Zee 完成 SSE 流式传输（聊天才能实时显示）
- 任务 4 需要等 Zee 完成代码执行沙箱（运行代码才能有输出）
- **等待期间可以先做任务 1（Settings），然后做任务 2 的 UI 部分（不接 AI）**

## 提交 PR 流程

每完成一个任务就提一个 PR：

```bash
# 完成任务 1 后
git add .
git commit -m "feat: 实现 Settings 设置页面"
git push origin feat/pages-interactive-C
gh pr create --title "feat: 实现 Settings 设置页面" --body "
## 实现内容
- 设置页面 UI（API Key 配置 + 学习偏好）
- 后端 settings API（GET/PUT）
- API Key 掩码显示/切换

## 测试
- [x] API Key 显示/隐藏切换
- [x] 保存后刷新不丢失
- [x] 恢复默认功能正常
"
```

## FAQ

**Q: 什么是 SSE 流式？我怎么用？**
A: 简单说就是后端一个字一个字地发，前端一个字一个字地显示。你不需要自己实现底层逻辑，Zee 会提供 `useStreamChat` hook，你只需要调用它的 API 就行。

**Q: Monaco Editor 怎么用？**
A: `@monaco-editor/react` 已经安装好了。基本用法：
```tsx
import Editor from '@monaco-editor/react';
<Editor height="100%" language="python" theme="vs-dark" value={code} onChange={setCode} />
```

**Q: 我写的页面怎么挂到课程详情的 Tab 里？**
A: `CourseDetailLayout.tsx`（队友 B 负责）会有 Tab 切换逻辑。你的组件会被当作子组件引入。在开发阶段，你可以先单独创建一个测试页面来开发，等 Layout 好了再集成。

**Q: 后端 SSE 怎么写？**
A: Zee 会在 `server/helpers/sse.ts` 里封装好 SSE 工具函数。你的路由只需要调用它，像这样：
```typescript
import { setupSSE } from '../helpers/sse.js';
// 在 POST /api/chat 中：
setupSSE(res);
// 然后调用 AI 服务，逐块写入响应
```

**Q: 代码执行的后端我不需要写吗？**
A: 对，Zee 负责写 `server/services/terminal.ts` 和 `server/routes/sandbox.ts`。你只需要在前端调用 `POST /api/courses/:id/labs/:labId/run` 并展示结果。

**Q: 不知道怎么写的组件怎么办？**
A: 1. 先看 `demo.html` 对应的 HTML → 2. 用 AI 辅助转换为 React 组件 → 3. 自己理解后提交。特别注意：Chat 的流式效果和 Lab 的编辑器是难点，可以问 Zee 要参考代码。
