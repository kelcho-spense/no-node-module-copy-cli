#!/usr/bin/env node
// filepath: d:\PersonalProjects\no-node-module-copy-cli\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as yargs from 'yargs';
import { CopyService } from './copy.service';

async function bootstrap() {
  // Parse command line arguments with yargs
  const argv = yargs
    .usage('Usage: $0 <source> <destination> [options]')
    .demandCommand(2, 'Please provide both source and destination directories')
    .positional('source', {
      describe: 'Source directory to copy from',
      type: 'string',
    })
    .positional('destination', {
      describe: 'Destination directory to copy to',
      type: 'string',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging'
    })
    .help('h')
    .alias('h', 'help')
    .argv;

  // Create a NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get the CopyService from the application context
  const copyService = app.get(CopyService);

  try {
    // Get source and destination from arguments
    const source = argv._[0].toString();
    const destination = argv._[1].toString();

    if (argv.verbose) {
      console.log(`Copying from ${source} to ${destination} (excluding node_modules)`);
    }

    // Perform the copy operation
    await copyService.copyDirectory(source, destination);

    console.log('Copy completed successfully!');
  } catch (error) {
    console.error('Error during file copy:', error);
    process.exit(1);
  } finally {
    // Close the application context
    await app.close();
  }
}

bootstrap();
