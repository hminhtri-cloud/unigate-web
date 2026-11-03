import { createApp } from '../server/app.mjs';

// Vercel serves dist/ as static assets and routes /api/* to this function.
// Unlike server/index.mjs, this entry point must not bind to a TCP port.
export default createApp();
