#!/usr/bin/env node
// Renders a claude-design (.dc.html) export in headless Chrome/Edge and dumps
// the final DOM to a clean HTML file. These exports ship as a self-executing
// bundle (a __bundler/manifest + __bundler/template blob unpacked by inline JS
// at load time) — the real markup does not exist as static text in the file,
// so it has to be rendered to be read. Safe to run on already-plain HTML too:
// if no bundler markers are found, the file is just cleaned and copied through.
//
// Usage: node unbundle-layout.js <input.html> [output.html] [virtualTimeBudgetMs]

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const [, , inputArg, outputArg, budgetArg] = process.argv;

if (!inputArg) {
  console.error('Usage: node unbundle-layout.js <input.html> [output.html] [virtualTimeBudgetMs]');
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const virtualTimeBudget = Number(budgetArg) || 8000;

const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.join(os.tmpdir(), `unbundled-${path.basename(inputPath, path.extname(inputPath))}-${Date.now()}.html`);

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      'Could not find a Chrome or Edge install. Set the CHROME_PATH env var to a browser executable and retry.\n' +
      `Checked: ${candidates.join(', ')}`
    );
  }
  return found;
}

function toFileUrl(p) {
  let resolved = p.replace(/\\/g, '/');
  if (!resolved.startsWith('/')) resolved = '/' + resolved; // C:/... -> /C:/...
  return 'file://' + resolved.split('/').map(encodeURIComponent).join('/');
}

const browser = findBrowser();
const fileUrl = toFileUrl(inputPath);

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--virtual-time-budget=${virtualTimeBudget}`,
  '--dump-dom',
  fileUrl,
];

let dumped;
try {
  dumped = execFileSync(browser, args, { maxBuffer: 200 * 1024 * 1024, encoding: 'utf8' });
} catch (err) {
  console.error(`Headless render failed: ${err.message}`);
  process.exit(1);
}

// Strip artifacts that are furniture of the design-canvas runtime, not part
// of the actual mockup: the runtime's own <script> tags (blob: sources / the
// unpacking bootstrap — never real app logic) and the per-element
// data-dc-tpl="N" markers the canvas templating engine stamps on every node.
const cleaned = dumped
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/\s+data-dc-tpl="[^"]*"/g, '');

fs.writeFileSync(outputPath, cleaned, 'utf8');

const sourceText = fs.readFileSync(inputPath, 'utf8').slice(0, 20000);
const isBundle = /__bundler\/manifest/.test(sourceText);

console.log(`Rendered ${isBundle ? 'bundle' : 'plain HTML'} -> ${outputPath}`);
console.log(`(${(cleaned.length / 1024).toFixed(0)} KB cleaned HTML)`);
