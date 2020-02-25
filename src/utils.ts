import * as crypto from 'crypto';
import * as fs from 'mz/fs';
import * as npmRun from 'npm-run';
import * as path from 'path';

const FILENAME = '.fast-skip';
const FULL_PATH = path.join('node_modules', FILENAME);

interface FileContent {
  lastHash: Record<string, string>;
}

export async function getLastHash(cmd: string) {
  try {
    const stringContent = await fs.readFile(FULL_PATH, 'utf-8');
    const content: FileContent = JSON.parse(stringContent);
    return content.lastHash[cmd];
  } catch (e) {
    return undefined;
  }
}

export async function reset() {
  if (await fs.exists(FULL_PATH)) {
    await fs.unlink(FULL_PATH);
  }
}

export async function setLastHash(cmd: string, hash: string) {
  let content: FileContent;
  try {
    const stringContent = await fs.readFile(FULL_PATH, 'utf-8');
    content = JSON.parse(stringContent);
  } catch (e) {
    content = {
      lastHash: {},
    };
  }
  content.lastHash = content.lastHash || {};
  content.lastHash[cmd] = hash;
  await fs.writeFile(FULL_PATH, JSON.stringify(content, null, 2), 'utf-8');
}

export async function getCurrentHash() {
  const fileNames = ['yarn.lock', 'package-lock.json'];
  for (const fileName of fileNames) {
    try {
      const content = await fs.readFile(fileName);
      if (content) {
        return crypto
          .createHash('sha256')
          .update(content)
          .digest('hex');
      }
    } catch (e) {
      continue;
    }
  }
}

export async function run(cmd: string, argv: string[]) {
  return new Promise<number>((resolve, reject) => {
    npmRun
      .spawn(cmd, argv, {
        stdio: 'inherit',
        shell: true,
      })
      .on('error', reject)
      .on('close', resolve);
  });
}
