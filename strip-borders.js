const fs = require('fs');
const path = require('path');

const excludeFiles = ['Quotation.jsx'];

// The floorHexes array contains regex patterns for various light background colors that should be replaced with the standardized 'bg-background' class. Each entry is a regex string that matches specific hex color codes used in the codebase.
// The surfaceHexes array contains regex patterns for various dark or surface background colors that should be replaced with the standardized 'bg-card' class. Each entry is a regex string that matches specific hex color codes used in the codebase.
// The processDirectory function reads each file in the specified directory, checks if it's a .jsx file, and applies the necessary replacements for background colors, text colors, and border colors. It also ensures that transition classes are not duplicated and that the correct classes are applied to root divs for consistent theming across the application.
// The function uses regular expressions to find and replace specific patterns in the file content, ensuring that the UI adheres to the desired design system. If any changes are made, the updated content is written back to the original file, and a message is logged to indicate which files were updated.
// The script is designed to be run from the command line and will process all .jsx files in the 'frontend/src' directory and its subdirectories, excluding
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