import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

const EXTENSIONS: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rs',
};

const COMMANDS: Record<string, (file: string) => string[]> = {
  python: (f) => ['python3', f],
  javascript: (f) => ['node', f],
  typescript: (f) => ['npx', 'tsx', f],
};

/**
 * 在本地沙箱中执行代码
 * 写入临时文件 → spawn 子进程 → 收集输出 → 清理文件
 */
export async function executeCode(
  code: string,
  language: string,
  timeout = 10000,
): Promise<ExecutionResult> {
  const ext = EXTENSIONS[language.toLowerCase()] || 'txt';
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `mozhi-${Date.now()}.${ext}`);

  fs.writeFileSync(tmpFile, code, 'utf8');

  try {
    const getCmd = COMMANDS[language.toLowerCase()];
    if (!getCmd) {
      return {
        stdout: '',
        stderr: `不支持的语言: ${language}`,
        exitCode: 1,
        timedOut: false,
      };
    }
    return await runProcess(getCmd(tmpFile), timeout);
  } finally {
    fs.promises.unlink(tmpFile).catch(() => {});
  }
}

function runProcess(
  command: string[],
  timeout: number,
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const proc = spawn(command[0], command.slice(1), {
      cwd: os.tmpdir(),
      env: { ...process.env },
      timeout,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1, timedOut });
    });

    proc.on('error', (err) => {
      resolve({ stdout, stderr: err.message, exitCode: 1, timedOut: false });
    });
  });
}
