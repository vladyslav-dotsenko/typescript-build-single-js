import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function build() {
  try {
    console.log('Building production bundle...');
    
    await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      outfile: 'dist/index.js',
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      sourcemap: true,
      minify: false, // Set to true for production minification
      treeShaking: true,
      external: [], // Add any external dependencies that shouldn't be bundled
    });

    console.log('✓ Build completed successfully!');
    console.log('  Output: dist/index.js');
  } catch (error) {
    console.error('✗ Build failed:', error);
    process.exit(1);
  }
}

build();

