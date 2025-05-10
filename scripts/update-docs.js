const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

// Update version in README.md
const readmePath = path.join(__dirname, '../README.md');
let readme = fs.readFileSync(readmePath, 'utf8');
const versionPattern = /Current version: ([0-9]+\.[0-9]+\.[0-9]+)/;
if (versionPattern.test(readme)) {
  readme = readme.replace(versionPattern, `Current version: ${packageJson.version}`);
} else {
  // Add version info if not present
  readme += `\n\nCurrent version: ${packageJson.version}`;
}
fs.writeFileSync(readmePath, readme);