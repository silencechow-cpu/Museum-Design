import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";

// Safe dirname that works in both ESM and bundled contexts
function getSafeDirname(): string {
  try {
    if (import.meta.dirname) {
      return import.meta.dirname;
    }
  } catch {
    // ignore
  }
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    // ignore
  }
  return process.cwd();
}

export async function setupVite(app: Express, server: Server) {
  // Dynamic import to avoid bundling vite.config into production build
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await import("../../vite.config")).default;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const safeDirname = getSafeDirname();
      const clientTemplate = path.resolve(
        safeDirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, dist/public is relative to the working directory (project root)
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
