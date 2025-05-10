#!/usr/bin/env node
// filepath: d:\PersonalProjects\no-node-module-copy-cli\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CopyService } from './copy.service';
import * as readline from 'readline';
import * as yargs from 'yargs';

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function bootstrap() {
  const argv = yargs
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      description: 'Run in interactive mode',
      default: false
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
      default: false
    })
    .help('h')
    .alias('h', 'help')
    .argv;

  // Create a NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get the CopyService from the application context
  const copyService = app.get(CopyService);

  try {
    let source: string;
    let destination: string;

    // If interactive mode or no arguments provided, prompt for inputs
    if (argv.interactive || argv._.length < 2) {
      console.log('=== No Node Module Copy CLI ===');
      source = await prompt('Source directory? ');
      destination = await prompt('Destination directory? ');

      const verbose = (await prompt('Enable verbose logging? (y/n) ')).toLowerCase() === 'y';
      if (verbose) argv.verbose = true;
    } else {
      // Get source and destination from arguments
      source = argv._[0].toString();
      destination = argv._[1].toString();
    }

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
