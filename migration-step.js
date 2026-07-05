const fs = require('fs');
const path = require('path');

// This script recursively processes all .jsx files in the specified directory and its subdirectories. It fixes broken opacity modifiers, deduplicates transition classes, and corrects layout background classes. The cleaned content is then written back to the original file if any changes were made.
// Usage: node migration-step.js
// Note: Make sure to run this script from the root of your project where the 'frontend/src' directory is located.

// Function to recursively process directories and clean up .jsx files

const excludeFiles = ['Quotation.jsx'];

// The floorHexes array contains regex patterns for various light background colors that should be replaced with the standardized 'bg-background' class. Each entry is a regex string that matches specific hex color codes used in the codebase.
// The surfaceHexes array contains regex patterns for various dark or surface background colors that should be replaced with the standardized 'bg-card' class. Each entry is a regex string that matches specific hex color codes used in the codebase.
// The processDirectory function reads each file in the specified directory, checks if it's a .jsx file, and applies the necessary replacements for background colors, text colors, and border colors. It also ensures that transition classes are not duplicated and that the correct classes are applied to root divs for consistent theming across the application.
// The function uses regular expressions to find and replace specific patterns in the file content, ensuring that the UI adheres to the desired design system. If any changes are made, the updated content is written back to the original file, and a message is logged to indicate which files were updated.
// The script is designed to be run from the command line and will process all .jsx files in the 'frontend/src' directory and its subdirectories, excluding any files listed in the excludeFiles array.
const floorHexes = [
  'bg-\\[#f8f9fa\\]', 'bg-\\[#f8f8f8\\]', 'bg-\\[#fafafa\\]', 'bg-\\[#fdfdfb\\]', 
  'bg-\\[#f3f4f6\\]', 'bg-\\[#fafaf9\\]', 'bg-\\[#f5f5f0\\]', 'bg-\\[#0a0a0a\\]', 
  'bg-\\[#fcfaf2\\]', 'bg-\\[#F3F3F3\\]'
];

const surfaceHexes = [
  'bg-\\[#1a1a1a\\]', 'bg-\\[#1A1A1A\\]', 'bg-\\[#F9F4DA\\]', 'bg-\\[#ebebeb\\]', 'bg-gray-50'
];

// The processDirectory function reads each file in the specified directory, checks if it's a .jsx file, and applies the necessary replacements for background colors, text colors, and border colors. It also ensures that transition classes are not duplicated and that the correct classes are applied to root divs for consistent theming across the application.
// The function uses regular expressions to find and replace specific patterns in the file content, ensuring that the UI adheres to the desired design system. If any changes are made, the updated content is written back to the original file, and a message is logged to indicate which files were updated.
// The script is designed to be run from the command line and will process all .jsx files in the 'frontend/src' directory and its subdirectories, excluding any files listed in the excludeFiles array.
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

      // Floors
      floorHexes.forEach(hex => {
        const regex = new RegExp(hex + '(\\/[0-9]+)?', 'g');
        content = content.replace(regex, (match, opacity) => {
          return opacity ? `bg-background${opacity} transition-all duration-300` : `bg-background transition-all duration-300`;
        });
      });

      // Surfaces
      surfaceHexes.forEach(hex => {
        const regex = new RegExp(hex + '(\\/[0-9]+)?', 'g');
        content = content.replace(regex, (match, opacity) => {
          return opacity ? `bg-card${opacity} transition-all duration-300` : `bg-card transition-all duration-300`;
        });
      });

      // Typography
      content = content.replace(/text-black/g, 'text-textMain transition-colors duration-300');
      content = content.replace(/text-gray-[3456]00(\/[0-9]+)?/g, (match, opacity) => {
        return opacity ? `text-textMain/50 transition-colors duration-300` : `text-textMain/50 transition-colors duration-300`;
      });
      content = content.replace(/text-gray-700(\/[0-9]+)?/g, 'text-textMain/70 transition-colors duration-300');

      // Specifically replace 'text-white' on root wrappers for dashboards
      content = content.replace(/flex min-h-screen bg-background transition-all duration-300 text-white/g, 'flex min-h-screen bg-background transition-all duration-300 text-textMain transition-colors duration-300');
      content = content.replace(/min-h-screen bg-background transition-all duration-300 flex items-center justify-center p-6 font-sans text-white/g, 'min-h-screen bg-background transition-all duration-300 flex items-center justify-center p-6 font-sans text-textMain transition-colors duration-300');
      content = content.replace(/min-h-screen bg-background transition-all duration-300 flex items-center justify-center text-white p-4/g, 'min-h-screen bg-background transition-all duration-300 flex items-center justify-center text-textMain transition-colors duration-300 p-4');

      // Borders
      content = content.replace(/border-gray-[123456789]00(\/[0-9]+)?/g, 'border-border transition-colors duration-300');
      content = content.replace(/border-gray-50(\/[0-9]+)?/g, 'border-border transition-colors duration-300');

      // Ensure `bg-white` is handled on root divs. "REPLACE all bg-[#fcfcfc], bg-white, and hardcoded hex backgrounds with bg-background."
      // BUT only on outermost wrappers. Component Surfaces REPLACE bg-white with bg-card. 
      // The `refactor-theme.js` already converted `bg-white` to `bg-card`. 
      // Some files might have `bg-card` on their root instead of `bg-background` because of this!
      // If we see `<div className="... bg-card ... min-h-screen`, we should change it to `bg-background`.
      content = content.replace(/min-h-screen bg-card( transition-colors duration-300)?/g, 'min-h-screen bg-background transition-all duration-300');

      // Clean up multiple transitions
      content = content.replace(/(transition-colors duration-300\s*){2,}/g, 'transition-colors duration-300 ');
      content = content.replace(/(transition-all duration-300\s*){2,}/g, 'transition-all duration-300 ');
      content = content.replace(/transition-all duration-300 transition-colors duration-300/g, 'transition-all duration-300');
      content = content.replace(/transition-colors duration-300 transition-all duration-300/g, 'transition-all duration-300');
      content = content.replace(/transition-all duration-300 transition-colors/g, 'transition-all duration-300');
      content = content.replace(/transition-colors duration-300 transition-colors/g, 'transition-colors duration-300');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory('./frontend/src');
console.log('Comprehensive migration complete.');
