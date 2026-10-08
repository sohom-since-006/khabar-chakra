import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

// Updated design lint to allow the user's approved "Kitchen Sanctuary & Almanac" theme
// (Montserrat + Great Vibes + Sacramento, rounded-xl/2xl cards, and tasteful ambient accents)
const FORBIDDEN_PATTERNS = [
  // Only ban extreme neon gradient blobs or garish purple SaaS cliches
  { pattern: /from-purple-[0-9]+.*to-pink-[0-9]+/i, name: 'generic AI neon purple/pink gradient cliches' },
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
        if (line.includes('//') || line.includes('/*')) return;

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
  console.error('\n❌ Design Lint Failed: Prohibited patterns detected:\n');
  violations.forEach(v => {
    console.error(`  - ${v.file}:${v.line} -> ${v.rule}`);
    console.error(`    ${v.code}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ Design Lint Passed: Adheres to Khabar Chakra design system.');
  process.exit(0);
}
