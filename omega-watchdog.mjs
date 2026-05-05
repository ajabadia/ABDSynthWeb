import fs from 'fs';
import http from 'http';
import path from 'path';

// CONFIGURATION
const PORT = 3001;
const WATCH_DIR = process.argv[2] || './'; // Target directory from CLI
const TARGET_EXT = '.acemm';

console.log(`\n[OMEGA WATCHDOG] Starting industrial monitor...`);
console.log(`[OMEGA WATCHDOG] Watching: ${path.resolve(WATCH_DIR)}`);
console.log(`[OMEGA WATCHDOG] Port: ${PORT}\n`);

let clients = [];

// SSE SERVER
const server = http.createServer((req, res) => {
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    console.log(`[WATCHDOG] Client connected: ${clientId} (Total: ${clients.length})`);

    req.on('close', () => {
      clients = clients.filter(c => c.id !== clientId);
      console.log(`[WATCHDOG] Client disconnected: ${clientId}`);
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT);

// FILE WATCHER
let watchTimeout;
fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith(TARGET_EXT)) {
    // Debounce to avoid multiple triggers on single save
    clearTimeout(watchTimeout);
    watchTimeout = setTimeout(() => {
      console.log(`\n[WATCHDOG] Change detected: ${filename}`);
      
      try {
        const filePath = path.join(WATCH_DIR, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const payload = JSON.stringify({
          filename,
          content,
          timestamp: new Date().toISOString()
        });

        clients.forEach(client => {
          client.res.write(`data: ${payload}\n\n`);
        });
        
        console.log(`[WATCHDOG] Update pushed to ${clients.length} clients.`);
      } catch (err) {
        console.error(`[WATCHDOG] Error reading file: ${err.message}`);
      }
    }, 100);
  }
});
