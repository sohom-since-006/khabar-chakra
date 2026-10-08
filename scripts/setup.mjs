import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Khabar Chakra Setup ---');

// 1. Check Node version
const [major] = process.versions.node.split('.').map(Number);
if (major < 20) {
  console.error(`❌ Node >= 20.9 required. Detected v${process.versions.node}`);
  process.exit(1);
}
console.log(`✅ Node v${process.versions.node} OK`);

// 2. Check .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envLocalPath);
  console.log('✅ Created .env.local from .env.example');
} else if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local already exists');
}

// 3. Check Docker status
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✅ Docker CLI detected');
} catch {
  console.warn('⚠️  Docker not running or not in PATH.');
  console.warn('   Running with remote Supabase project configured in .env.local.');
}

console.log('\n--- Setup Complete ---');
console.log('Run `npm run dev` to start the development server at http://localhost:3000\n');
