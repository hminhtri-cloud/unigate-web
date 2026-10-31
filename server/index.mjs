import { createApp } from './app.mjs';
import { migrate } from './schema.mjs';
import { pool } from './db.mjs';
await migrate();
const port = Number(process.env.PORT || 3001);
const server = createApp().listen(port, '127.0.0.1', () => console.log(`UniGate API / production web: http://localhost:${port}`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => server.close(async () => { await pool.end(); process.exit(0); }));
