import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
const { source, destination } = workerData;

try {
  // Perform file copying
  fs.copyFileSync(source, destination);
  // Send a message back to the parent thread with progress
  parentPort?.postMessage({ progress: 1 });
} catch (err) {
  console.error(err);
  parentPort?.postMessage({ progress: 0 });
}
finally {
  // Notify the parent thread that the worker has finished
  parentPort?.close();
}