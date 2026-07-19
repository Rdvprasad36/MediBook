import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Import our new JS-based MVC routers
import UserRoutes from './src/server/routes/UserRoutes.js';
import DoctorRoutes from './src/server/routes/DoctorRoutes.js';
import AdminRoutes from './src/server/routes/AdminRoutes.js';

// Import connectToDB helper
import { connectToDB } from './src/server/connectToDB.js';

// Import legacy apiRouter for dual-compatibility safety (guarantees old endpoints don't fail)
import legacyApiRouter from './src/server/routes/api.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database Connection
  await connectToDB();

  // Body parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure uploads directory exists and is served statically
  const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve medical reports statically under /uploads
  app.use('/uploads', express.static(uploadsDir));

  // Mount MVC routers precisely as requested
  app.use('/api/user', UserRoutes);
  app.use('/api/doctor', DoctorRoutes);
  app.use('/api/admin', AdminRoutes);

  // Mount legacy endpoints under /api to avoid breaking any hardcoded client calls
  app.use('/api', legacyApiRouter);

  // Serve a default blank file if the user requests a non-existent medical report in the UI.
  app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, 'MediBook - Secure Medical Report Placeholder Content.\nReport ID: ' + req.params.filename);
    }
    res.sendFile(filePath);
  });

  // Integration of Vite Dev Server in Development or Static Assets in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated successfully in server.js.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset serving configured in server.js.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediBook JS Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Critical failure starting MediBook JS Server:', error);
});
