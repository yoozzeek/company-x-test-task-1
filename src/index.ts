import { getConfig } from './config';
import bootstrapApp from './bootstrap';

async function main() {
  const config = getConfig();
  const { app, pgPool } = await bootstrapApp(config);

  app.listen({ host: config.appHost, port: config.appPort }, function (err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    console.log(`Server is now listening on ${address}`);
  });

  let isShuttingDown = false;
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.info(`${signal} received. Gracefully shutting down...`);

      const timeout = setTimeout(() => {
        console.warn('Forcefully shutting down after 20 seconds.');
        process.exit(1);
      }, 10000);
      timeout.unref();

      await app.close();
      await pgPool.end();

      console.log('[shutdown] Closed out remaining connections');
      clearTimeout(timeout);
      process.exit(0);
    });
  });
}

void main();
