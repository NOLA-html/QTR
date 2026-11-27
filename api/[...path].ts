import app from '../server.ts';

// Vercel routes /api/* requests through this catch-all function.
// Express retains the original request path and handles the existing /api routes.
export default app;
