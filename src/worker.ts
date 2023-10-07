const { parentPort, workerData } = require('worker_threads'); // eslint-disable-line @typescript-eslint/no-var-requires

for (const key of Object.keys(workerData)) {
  const value = Number(workerData[key]) || 0;
  if (value > 0) {
    setInterval(() => {
      parentPort?.postMessage(key);
    }, value * 1000);
  }
}
