declare var self: Worker;

for (let key of Object.keys(process.env)) {
  const value = Number.parseInt(process.env[key]!) || 0;
  if (value > 0) {
    setInterval(() => {
      self.postMessage(key);
    }, value * 1000);
  }
}
