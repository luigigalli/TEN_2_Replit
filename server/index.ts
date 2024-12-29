import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import { config } from "./config";
import { ServerError } from "./errors";
import { handleViteMiddleware, handleStaticFiles } from "./middleware/vite-handler";

// Initialize Express application with proper error handling
async function initializeApp() {
  try {
    const app = express();

    // Basic security headers
    app.use((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    // Configure CORS with environment-aware origins
    app.use(cors({
      origin: config.server.corsOrigins,
      credentials: true
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Request logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          console.log(`${new Date().toLocaleTimeString()} [express] ${logLine}`);
        }
      });

      next();
    });

    // Health check endpoint
    app.get("/api/health", (_req: Request, res: Response) => {
      res.json({ 
        status: "ok", 
        environment: config.env,
        timestamp: new Date().toISOString()
      });
    });

    // Initialize routes
    const server = registerRoutes(app);

    // Global error handler
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);

      if (err instanceof ServerError) {
        res.status(err.statusCode).json({ 
          error: err.message,
          code: err.code,
          ...(config.env === 'development' ? { details: err.details } : {})
        });
      } else {
        res.status(500).json({ 
          error: 'Internal Server Error',
          ...(config.env === 'development' ? { stack: err.stack } : {})
        });
      }
    });

    // Set up environment-specific middleware
    if (config.env === 'development') {
      await handleViteMiddleware(app, server);
    } else {
      handleStaticFiles(app);
    }

    return { app, server };
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
}

// Start the server with proper error handling
(async () => {
  try {
    const { server } = await initializeApp();

    // Wrap server.listen in a promise for better error handling
    await new Promise((resolve, reject) => {
      server.listen(config.server.port, config.server.host)
        .once('listening', () => {
          console.log(`${new Date().toLocaleTimeString()} [express] Server running in ${config.env} mode`);
          console.log(`${new Date().toLocaleTimeString()} [express] API available at http://${config.server.host}:${config.server.port}/api`);
          console.log(`${new Date().toLocaleTimeString()} [express] Client available at http://${config.server.host}:${config.server.port}`);
          resolve(true);
        })
        .once('error', (error: Error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();