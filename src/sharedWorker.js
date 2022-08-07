export const startSharedWorker = () => {
  if (typeof SharedWorker === "function") {
    yourWorker = new SharedWorker("./api.js");
    yourWorker.port.start();
  }
};
