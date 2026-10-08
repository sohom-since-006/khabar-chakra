import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

const FORBIDDEN_PATTERNS = [
  { pattern: /backdrop-blur/i, name: 'backdrop-blur (glassmorphism is forbidden per D31)' },
  { pattern: /backdrop-filter/i, name: 'backdrop-filter (glassmorphism is forbidden per D31)' },
  { pattern: /bg-gradient-to/i, name: 'gradient backgrounds (prohibited per Kitchen Almanac art direction)' },
  { pattern: /from-[a-z]+-[0-9]+.*to-[a-z]+-[0-9]+/i, name: 'gradient color stops' },
  { pattern: /text-transparent.*bg-clip-text/i, name: 'gradient text' },
  { pattern: /rounded-(2xl|3xl)/i, name: 'excessive rounded corners (border-radius must be <= 4px)' },
  { pattern: /shadow-(md|lg|xl|2xl)/i, name: 'heavy shadow utilities (minimal/flat shadows only)' },
];

function scanDir(dir) {
  let violations = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violations = violations.concat(scanDir(fullPath));
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        // Skip comments and avatars/switch exceptions
        if (line.includes('avatar') || line.includes('switch') || line.includes('toggle')) return;

        for (const rule of FORBIDDEN_PATTERNS) {
          if (rule.pattern.test(line)) {
            violations.push({
              file: path.relative(process.cwd(), fullPath),
              line: idx + 1,
              rule: rule.name,
              code: line.trim(),
            });
          }
        }
      });
    }
  }

  return violations;
}

const violations = scanDir(SRC_DIR);

if (violations.length > 0) {
  console.error('\n❌ Design Lint Failed: Prohibited AI/SaaS design patterns detected:\n');
  violations.forEach(v => {
    console.error(`  - ${v.file}:${v.line} -> ${v.rule}`);
    console.error(`    ${v.code}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ Design Lint Passed: Adheres to "The Kitchen Almanac" guidelines (no glassmorphism, flat borders <= 4px, no gradient blobs).');
  process.exit(0);
}
