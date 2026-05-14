const fs = require('fs');
const path = require('path');

const excludeFiles = ['Quotation.jsx'];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') && !excludeFiles.includes(path.basename(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Replace any hardcoded tailwind gray borders with border-border so they become transparent
      content = content.replace(/border-gray-[0-9]+/g, 'border-border');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated borders in: ${fullPath}`);
      }
    }
  }
}

processDirectory('./frontend/src');
console.log('Border stripping complete.');