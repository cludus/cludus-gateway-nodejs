import { Worker } from 'worker_threads';
import appConfig from './config';
import { JwtUserFetcher } from './fetcher/JwtUserFetcher';
import { UserHandler } from './handler/UserHandler';
import { configureLogging } from './logger';
import { UserFetcher } from './model/types';
import { AppServer } from './server';
import { ConsulDiscoveryHandler } from './handler/DiscoveryHandler';

configureLogging();

const discoveryHandler = new ConsulDiscoveryHandler();
discoveryHandler.init().then((remoteHandler) => {
  const jwtFetcher: UserFetcher | undefined = appConfig.jwtSecretKey
    ? new JwtUserFetcher(appConfig.jwtSecretKey, appConfig.jwtIssuer)
    : undefined;

  const userHandler = new UserHandler(jwtFetcher, remoteHandler);

  if (appConfig.workerDelayInSeconds > 0) {
    const checkHeartBeatsKey = 'check-heartbeats';

    let workerFile = './src/worker.ts';
    // @ts-ignore
    if (!process[Symbol.for('ts-node.register.instance')]) {
      workerFile = './build/worker.js';
    }
    const worker = new Worker(workerFile, {
      workerData: {
        [checkHeartBeatsKey]: appConfig.workerDelayInSeconds,
      }
    });
    worker.on('message', (key) => {
      if (key == checkHeartBeatsKey) {
        userHandler.checkHeartbeats(appConfig.maxUserHeartbeatDelayInSeconds);
      }
    });
  }

  const server = new AppServer(userHandler, appConfig);
  server.start();
});
