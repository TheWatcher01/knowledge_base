#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const testResultsRoot = path.join(appRoot, 'test-results');

const args = process.argv
  .slice(2)
  .filter((value) => value !== '--');
let targetPath;
let outputPath;
let cleanAfter = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--out') {
    outputPath = args[index + 1];
    index += 1;
    continue;
  }
  if (arg === '--clean') {
    cleanAfter = true;
    continue;
  }
  if (!targetPath) {
    targetPath = arg;
    continue;
  }
  console.error(`Argument inattendu: ${arg}`);
  process.exitCode = 1;
  process.exit();
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: 'inherit', ...options });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Commande ${command} sortie avec le code ${code}`));
    });
    child.on('error', reject);
  });
}

async function pathStats(candidate) {
  try {
    return await fs.stat(candidate);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function findAllTraceDirs() {
  const rootStats = await pathStats(testResultsRoot);
  if (!rootStats || !rootStats.isDirectory()) {
    throw new Error(`Dossier introuvable: ${testResultsRoot}`);
  }

  const entries = await fs.readdir(testResultsRoot, { withFileTypes: true });
  const traces = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(testResultsRoot, entry.name);
    const zipPath = path.join(directory, 'trace.zip');
    const stats = await pathStats(zipPath);
    if (!stats) continue;

    traces.push({ directory, zipPath, mtimeMs: stats.mtimeMs });
  }

  if (traces.length === 0) {
    throw new Error(`Aucun fichier trace.zip trouvé dans ${testResultsRoot}`);
  }

  traces.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return traces;
}

async function resolveTargets() {
  if (!targetPath) {
    return findAllTraceDirs();
  }

  const resolved = path.resolve(process.cwd(), targetPath);
  const stats = await pathStats(resolved);
  if (!stats) {
    throw new Error(`Chemin introuvable: ${resolved}`);
  }

  if (stats.isDirectory()) {
    const zipPath = path.join(resolved, 'trace.zip');
    const zipStats = await pathStats(zipPath);
    if (!zipStats) {
      throw new Error(`Aucun trace.zip dans ${resolved}`);
    }
    return [{ directory: resolved, zipPath, mtimeMs: zipStats.mtimeMs ?? Date.now() }];
  }

  if (stats.isFile() && resolved.endsWith('.zip')) {
    return [{ directory: path.dirname(resolved), zipPath: resolved, mtimeMs: stats.mtimeMs ?? Date.now() }];
  }

  throw new Error('Le chemin doit pointer vers un dossier de test-results ou un fichier trace.zip');
}

async function unzipTrace(zipPath, destination) {
  await run('unzip', ['-o', '-q', zipPath, '-d', destination]);
}

async function readJsonLines(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Impossible de parser la ligne ${index + 1} du fichier ${filePath}: ${(error && error.message) || error}`);
      }
    });
}

async function readJsonLinesIfPresent(filePath) {
  try {
    return await readJsonLines(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function readTextIfPresent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function readJsonIfPresent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

function createSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

async function resolveOutputFile({ directory, total }) {
  const relative = path.relative(testResultsRoot, directory) || path.basename(directory);
  const slug = createSlug(relative) || 'trace';

  if (!outputPath) {
    const baseDir = path.join(appRoot, 'tests', 'e2e');
    const fileName = total > 1 ? `traces-logs-${slug}.json` : 'traces-logs.json';
    return { filePath: path.join(baseDir, fileName), slug };
  }

  const resolved = path.resolve(process.cwd(), outputPath);
  const stats = await pathStats(resolved);

  if (stats?.isDirectory()) {
    return { filePath: path.join(resolved, `traces-logs-${slug}.json`), slug };
  }

  const ext = path.extname(resolved);
  if (!ext) {
    return { filePath: path.join(resolved, `traces-logs-${slug}.json`), slug };
  }

  if (total > 1) {
    const baseName = path.basename(resolved, ext);
    return {
      filePath: path.join(path.dirname(resolved), `${baseName}-${slug}${ext}`),
      slug,
    };
  }

  return { filePath: resolved, slug };
}

async function main() {
  const targets = await resolveTargets();
  const total = targets.length;
  const lastRunPath = path.join(testResultsRoot, '.last-run.json');
  const lastRun = await readJsonIfPresent(lastRunPath);

  for (const { directory, zipPath } of targets) {
    await unzipTrace(zipPath, directory);

    const networkPath = path.join(directory, '0-trace.network');
    const stacksPath = path.join(directory, '0-trace.stacks');
    const tracePath = path.join(directory, '0-trace.trace');
    const errorContextPath = path.join(directory, 'error-context.md');
    const testTracePath = path.join(directory, 'test.trace');

    const [network, stacks, trace, errorContext, testTrace] = await Promise.all([
      readJsonLinesIfPresent(networkPath),
      readJsonLinesIfPresent(stacksPath),
      readJsonLinesIfPresent(tracePath),
      readTextIfPresent(errorContextPath),
      readJsonLinesIfPresent(testTracePath),
    ]);

    const { filePath, slug } = await resolveOutputFile({ directory, total });

    const result = {
      generatedAt: new Date().toISOString(),
      source: path.relative(appRoot, directory),
      identifier: slug,
    };

    if (network) {
      result.network = network;
    }
    if (stacks) {
      result.stacks = stacks;
    }
    if (trace) {
      result.trace = trace;
    }
    if (errorContext) {
      result.errorContext = errorContext;
    }
    if (testTrace) {
      result.testTrace = testTrace;
    }
    if (lastRun) {
      result.lastRun = lastRun;
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`Trace exportée vers ${filePath}`);
  }

  if (cleanAfter) {
    console.log(`Suppression du dossier ${testResultsRoot}...`);
    await fs.rm(testResultsRoot, { recursive: true, force: true });
    console.log('Dossier test-results supprimé.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
