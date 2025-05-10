#!/usr/bin/env node
// filepath: d:\PersonalProjects\no-node-module-copy-cli\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CopyService } from './copy.service';
import * as readline from 'readline';
import * as yargs from 'yargs';
import * as colors from 'colors';

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
    let continueRunning = true;

    while (continueRunning) {
      let source: string;
      let destination: string;      // If interactive mode or no arguments provided, prompt for inputs
      if (argv.interactive || argv._.length < 2) {
        console.log(colors.cyan.bold('\n=== No Node Module Copy CLI ==='));
        source = await prompt(colors.yellow('Source directory? '));
        destination = await prompt(colors.yellow('Destination directory? '));

        const verbose = (await prompt(colors.yellow('Enable verbose logging? (y/n) '))).toLowerCase() === 'y';
        if (verbose) argv.verbose = true;
      } else {
        // Get source and destination from arguments
        source = argv._[0].toString();
        destination = argv._[1].toString();

        // After the first run, clear the arguments to force interactive mode
        argv._ = [];
      }

      if (argv.verbose) {
        console.log(`Copying from ${source} to ${destination} (excluding node_modules)`);
      }

      // Perform the copy operation
      await copyService.copyDirectory(source, destination);      // No need for this message as we're already showing it in the service
      // with better formatting

      // Ask if the user wants to copy again
      const copyAgain = (await prompt(colors.yellow('\nWould you like to copy more files? (y/n) '))).toLowerCase();
      continueRunning = copyAgain === 'y' || copyAgain === 'yes';
    }

    console.log(colors.cyan.bold('\nThank you for using No Node Module Copy CLI! 👋'));
  } catch (error) {
    console.error('Error during file copy:', error);
    process.exit(1);
  } finally {
    // Close the application context
    await app.close();
  }
}

bootstrap();
