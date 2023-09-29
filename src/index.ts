import appConfig from './config';
import { UserHandler } from './handler/UserHandler';
import { configureLogging } from './logger';
import { AppServer } from './server';

configureLogging();

const userHandler = new UserHandler();

if (appConfig.workerDelayInSeconds > 0) {
  const checkHeartBeatsKey = 'check-heartbeats';

  const workerURL = new URL('./worker.ts', import.meta.url).href;
  const worker = new Worker(workerURL, {
    env: {
      [checkHeartBeatsKey]: String(appConfig.workerDelayInSeconds),
    }
  });

  worker.onmessage = (event: MessageEvent<string>) => {
    if (event.data == checkHeartBeatsKey) {
      userHandler.checkHeartbeats(appConfig.maxUserHeartbeatDelayInSeconds);
    }
  };
}

const server = new AppServer(userHandler, appConfig);
server.start();
