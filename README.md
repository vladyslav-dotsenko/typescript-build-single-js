# TypeScript Build Single JS

A TypeScript app template that builds into a single JS file and supports basic local static server.

## Features

- **Build Mode**: Compiles all code from `src/index.ts` (including all exports) into a single JavaScript file
- **Serve Mode**: Creates a bundled file and serves it on localhost with a configurable filename for use in other projects

## Setup

```bash
npm install
```

## Usage

### Build Mode

Builds all TypeScript code into a single JavaScript file:

```bash
npm run build
```

Output: `dist/index.js`

### Serve Mode

Creates a bundled file and serves it on localhost:

```bash
npm run serve
```

The serve server will:
- Bundle all code from `src/index.ts` into a single file
- Serve it at `http://localhost:3000/app.js` (configurable)
- Watch for file changes and rebuild automatically
- Reload config changes automatically

### Configuration

Edit `dev.config.json` to customize the serve server:

```json
{
  "filename": "app.js",
  "port": 3000,
  "host": "localhost"
}
```

## Using the Serve Bundle in Other Projects

You can reference the serve bundle in your other projects:

```html
<!-- In an HTML file -->
<script type="module">
  import { greet, add } from 'http://localhost:3000/app.js';
  console.log(greet('World')); // Hello, World!
  console.log(add(2, 3)); // 5
</script>
```

Or in a Node.js project:

```javascript
import { greet, add } from 'http://localhost:3000/app.js';
```

## Project Structure

```
.
├── src/
│   ├── index.ts          # Main entry point
│   └── utils/
│       └── math.ts       # Example utility module
├── scripts/
│   ├── build.js          # Build script
│   └── serve.js          # Serve server script
├── dist/                 # Build output (gitignored)
├── .dev/                 # Serve output (gitignored)
├── dev.config.json       # Serve server configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Development

- The serve server watches for changes in `src/` and rebuilds automatically
- Config changes are also watched and reloaded
- Use `Ctrl+C` to stop the serve server

