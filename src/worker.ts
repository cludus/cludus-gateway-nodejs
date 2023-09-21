import appConfig from './config';

declare var self: Worker;

let enabled = true;

self.onmessage = (event: MessageEvent<boolean>) => {
  enabled = event.data;
  if (!enabled) {
    self.terminate();
  }
};

while (enabled) {
  await Bun.sleep(appConfig.workerDelayInSeconds * 1000);
  self.postMessage(enabled);
}
