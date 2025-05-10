import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Worker } from 'worker_threads';
import * as cliProgress from 'cli-progress';

@Injectable()
export class CopyService {
  private progressBar: cliProgress.SingleBar;

  copyDirectory(source: string, destination: string) {
    const files = this.getFilesToCopy(source);
    this.initializeProgressBar(files.length);

    const copyTasks = files.map(file => new Worker('./copyWorker.ts', {
      workerData: { source: file.source, destination: file.destination },
    }));

    copyTasks.forEach(worker => {
      worker.on('message', (msg) => {
        this.updateProgress(msg);
      });

      worker.on('error', (err) => {
        console.error('Error:', err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });
    });
  }

  private initializeProgressBar(totalFiles: number) {
    this.progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    this.progressBar.start(totalFiles, 0);
  }

  private updateProgress(message: any) {
    this.progressBar.update(message.progress);
  }

  private getFilesToCopy(source: string) {
    let files: any[] = [];
    fs.readdirSync(source).forEach(file => {
      const filePath = path.join(source, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && file !== 'node_modules') {
        files.push({ source: filePath, destination: filePath });
      }
    });
    return files;
  }
}
