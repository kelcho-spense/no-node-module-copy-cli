import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Worker } from 'worker_threads';
import * as cliProgress from 'cli-progress';

@Injectable()
export class CopyService {
    private progressBar: cliProgress.SingleBar;
    async copyDirectory(source: string, destination: string): Promise<void> {
        // Ensure source directory exists
        if (!fs.existsSync(source)) {
            throw new Error(`Source directory does not exist: ${source}`);
        }

        // Create destination directory if it doesn't exist
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        // Get all files to copy (excluding node_modules)
        const files = this.getFilesToCopy(source, source, destination);

        if (files.length === 0) {
            console.log('No files to copy (skipping node_modules)');
            return;
        }

        this.initializeProgressBar(files.length);
        console.log(`Copying ${files.length} files from ${source} to ${destination} (skipping node_modules)`);

        // Create a promise that resolves when all workers are done
        return new Promise<void>((resolve, reject) => {
            let completedWorkers = 0;
            let errors = 0;
            // Create worker for each file
            const copyTasks = files.map(file => {
                const worker = new Worker(path.join(__dirname, 'copyWorker.js'), {
                    workerData: { source: file.source, destination: file.destination },
                });

                worker.on('message', (msg) => {
                    this.updateProgress(msg);
                });

                worker.on('error', (err) => {
                    errors++;
                    console.error('Error during copy:', err);
                });

                worker.on('exit', (code) => {
                    completedWorkers++;

                    if (code !== 0) {
                        errors++;
                        console.error(`Worker stopped with exit code ${code}`);
                    }

                    // If all workers are done, resolve the promise
                    if (completedWorkers === files.length) {
                        this.progressBar.stop();
                        if (errors > 0) {
                            reject(new Error(`Completed with ${errors} errors.`));
                        } else {
                            resolve();
                        }
                    }
                });

                return worker;
            });
        });
    }
    private initializeProgressBar(totalFiles: number) {
        this.progressBar = new cliProgress.SingleBar({
            format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} files',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
        }, cliProgress.Presets.shades_classic);

        this.progressBar.start(totalFiles, 0);
    }

    private updateProgress(message: any) {
        if (message.progress === 1) {
            this.progressBar.increment();
        }
    } private getFilesToCopy(source: string, basePath = '', destBase = '') {
        let files: { source: string, destination: string }[] = [];
        const sourceBase = basePath || source;
        const destinationBase = destBase || source;

        fs.readdirSync(source).forEach(file => {
            const filePath = path.join(source, file);
            const stat = fs.statSync(filePath);

            // Skip node_modules directory
            if (stat.isDirectory() && file === 'node_modules') {
                return;
            }

            if (stat.isDirectory()) {
                // Recursively get files from subdirectories
                const subFiles = this.getFilesToCopy(filePath, sourceBase, destinationBase);
                files = [...files, ...subFiles];
            } else {
                // Get the relative path and create the destination path
                const relativePath = path.relative(sourceBase, filePath);
                const destPath = path.join(destinationBase, relativePath);

                // Create directory structure if it doesn't exist
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                // Add the file to the list
                files.push({ source: filePath, destination: destPath });
            }
        });
        return files;
    }
}
