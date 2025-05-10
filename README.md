# No Node Module Copy CLI

A command-line utility to copy directories while automatically excluding `node_modules` folders, built with NestJS. This tool provides efficient directory copying with a progress bar and multi-threaded operations for improved performance.

## Features

- Copy directories while skipping all `node_modules` folders
- Progress bar visualization during copying
- Multi-threaded file copying for better performance
- Simple command-line interface

## Installation

You can install this package locally for development:

```bash
# Using npm
npm install

# Using pnpm
pnpm install

# Using yarn
yarn install
```

## Usage

### Basic Command

```bash
npx no-node-module-copy <source-directory> <destination-directory>
```

### Options

```
Options:
  --help, -h     Show help information                                  [boolean]
  --version, -v  Show version information                               [boolean]
  --verbose      Enable verbose logging                                 [boolean]
```

## Development

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/no-node-module-copy-cli.git
cd no-node-module-copy-cli
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Running in Development

```bash
npm run start:dev -- <source-directory> <destination-directory>
```

### Testing

```bash
npm test
```

## Command-line Interface

The command-line interface is built using [yargs](https://github.com/yargs/yargs) with NestJS integration:

```powershell
# Install yargs if not already installed
npm install --save yargs
```

### Implementation Details

1. The CLI entry point is configured in `main.ts`:

   - Uses NestJS application context for dependency injection
   - Parses command-line arguments with yargs
   - Passes arguments to the `CopyService`
2. Worker Threads handle file copying in parallel for better performance
3. A progress bar shows real-time copying status

### CLI Command Entry Point

To make the command accessible globally, add a bin entry in your `package.json`:

```json
{
  "bin": {
    "no-node-module-copy": "./dist/main.js"
  }
}
```

Don't forget to add a shebang line at the top of your entry point file:

```typescript
#!/usr/bin/env node
// Your code continues here...
```

## Distribution Methods

### Global Installation

Install the CLI tool globally so it can be used from anywhere:

```powershell
# Link the package globally
npm link

# Now you can use it from anywhere
no-node-module-copy <source-directory> <destination-directory>
```

### Creating a Standalone Executable

Package the application as a standalone executable for distribution without Node.js dependencies:

#### Using pkg (recommended)

```powershell
# Install pkg globally
npm install -g pkg

# Add pkg configuration to package.json
```

Add this to your package.json:

```json
{
  "pkg": {
    "targets": ["node18-win-x64", "node18-linux-x64", "node18-macos-x64"],
    "outputPath": "dist-exe"
  }
}
```

Then build the executable:

```powershell
# Build with pkg
npm run build
pkg .

# Or use the provided script
npm run build:exe
```

#### Using nexe (alternative)

```powershell
# Install nexe globally
npm install -g nexe

# Build executable
nexe dist/main.js -o no-node-module-copy
```

## Next Steps

### Testing

Run the tests to ensure everything works correctly:

```powershell
# Run all tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run with coverage
npm run test:cov
```

### Adding Features

Consider implementing these additional features:

1. **File filtering**: Allow users to specify file patterns to include/exclude
2. **Dry-run mode**: Preview operations without actually copying files
3. **Verbose logging**: More detailed output for debugging
4. **Custom exclusions**: Allow users to specify additional directories to exclude
5. **Parallel processing controls**: Allow users to set the level of parallelism

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
