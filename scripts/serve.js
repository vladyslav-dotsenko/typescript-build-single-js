import * as esbuild from 'esbuild';
import express from 'express';
import { readFileSync, writeFileSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load serve config
const serveConfigPath = join(rootDir, 'dev.config.json');
let serveConfig = JSON.parse(readFileSync(serveConfigPath, 'utf-8'));

const outputDir = join(rootDir, '.dev');
const outputFile = join(outputDir, serveConfig.filename);

let server = null;
let isBuilding = false;

async function buildServeBundle() {
  if (isBuilding) return;
  isBuilding = true;

  try {
    console.log('Building serve bundle...');
    
    const result = await esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      outfile: outputFile,
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      sourcemap: 'inline',
      treeShaking: true,
      external: [],
      banner: {
        js: `// Serve bundle - Auto-generated\n// Source: ${new Date().toISOString()}\n`,
      },
    });

    console.log(`✓ Serve bundle built: ${serveConfig.filename}`);
    return result;
  } catch (error) {
    console.error('✗ Serve build failed:', error);
    return null;
  } finally {
    isBuilding = false;
  }
}

function startServer() {
  if (server) {
    console.log('Server already running');
    return;
  }

  const app = express();

  // Serve the bundled file
  app.get(`/${serveConfig.filename}`, (req, res) => {
    try {
      const fileContent = readFileSync(outputFile, 'utf-8');
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(fileContent);
    } catch (error) {
      res.status(404).send('File not found. Building...');
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', filename: serveConfig.filename });
  });

  const port = serveConfig.port || 3000;
  const host = serveConfig.host || 'localhost';

  server = app.listen(port, host, () => {
    console.log(`\n✓ Serve server running at http://${host}:${port}`);
    console.log(`  File available at: http://${host}:${port}/${serveConfig.filename}`);
    console.log(`  Health check: http://${host}:${port}/health\n`);
  });

  // Ensure server is set even if there's an error
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

async function startServe() {
  // Ensure output directory exists
  const { mkdirSync } = await import('fs');
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Initial build
  await buildServeBundle();
  startServer();

  // Watch for changes
  const srcDir = join(rootDir, 'src');
  watch(srcDir, { recursive: true }, async (eventType, filename) => {
    if (filename && (filename.endsWith('.ts') || filename.endsWith('.tsx'))) {
      console.log(`\n📝 File changed: ${filename}`);
      await buildServeBundle();
    }
  });

  // Watch config file
  watch(serveConfigPath, async (eventType) => {
    if (eventType === 'change') {
      console.log('\n⚙️  Config changed, reloading...');
      try {
        serveConfig = JSON.parse(readFileSync(serveConfigPath, 'utf-8'));
        console.log('✓ Config reloaded');
      } catch (error) {
        console.error('✗ Failed to reload config:', error);
      }
    }
  });

  console.log('👀 Watching for changes...\n');
}

// Handle graceful shutdown
function shutdown() {
  console.log('\n\nShutting down serve server...');
  if (server && server.listening) {
    server.close((err) => {
      if (err) {
        console.error('Error closing server:', err);
      } else {
        console.log('✓ Server stopped');
      }
      process.exit(0);
    });
    // Force exit after 3 seconds if close doesn't complete
    setTimeout(() => {
      console.log('⚠ Forcing exit...');
      process.exit(0);
    }, 3000);
  } else {
    console.log('✓ Server stopped');
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServe();

