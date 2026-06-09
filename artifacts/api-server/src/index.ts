import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

// In Vercel serverless functions, we don't start the server manually.
// We just export the app. Vercel automatically sets process.env.VERCEL="1".
if (!process.env.VERCEL) {
  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

export default app;
