import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';

const { source, destination } = workerData;

try {
    // Make sure the destination directory exists
    const destDir = path.dirname(destination);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }    // Perform file copying
    fs.copyFileSync(source, destination);

    // Send a message back to the parent thread with progress
    parentPort?.postMessage({ progress: 1, file: source, size: fs.statSync(source).size });
} catch (err) {
    console.error(`Error copying file ${source} to ${destination}:`, err);
    parentPort?.postMessage({ progress: 0, error: err.message, file: source, size: 0 });
} finally {
    // Notify the parent thread that the worker has finished
    parentPort?.close();
}