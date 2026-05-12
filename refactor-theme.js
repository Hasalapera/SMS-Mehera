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
      
      // Track if changes were made
      let originalContent = content;

      // Safe Mappings (Identity)
      content = content.replace(/bg-\[#b4a460\]/g, 'bg-primary transition-all duration-300');
      content = content.replace(/text-\[#b4a460\]/g, 'text-primary transition-all duration-300');
      content = content.replace(/border-\[#b4a460\]/g, 'border-primary transition-all duration-300');
      
      // Typography
      content = content.replace(/text-black/g, 'text-textMain transition-colors duration-300');
      content = content.replace(/text-gray-900/g, 'text-textMain transition-colors duration-300');
      content = content.replace(/text-gray-[456]00/g, 'text-textMain/50 transition-colors duration-300');
      
      // Borders
      content = content.replace(/border-gray-[12389]00/g, 'border-border transition-colors duration-300');
      
      // Backgrounds & Surfaces
      content = content.replace(/bg-white/g, 'bg-card transition-colors duration-300');
      content = content.replace(/bg-\[#141414\]/g, 'bg-card transition-colors duration-300');
      content = content.replace(/bg-\[#1A1A1A\]/g, 'bg-card transition-colors duration-300');
      content = content.replace(/bg-\[#fcfcfc\]/g, 'bg-background transition-colors duration-300');
      content = content.replace(/bg-gray-50/g, 'bg-card transition-colors duration-300');
      
      // Clean up multiple transitions (just in case they already existed or we injected multiple)
      content = content.replace(/(transition-all duration-300\s*){2,}/g, 'transition-all duration-300 ');
      content = content.replace(/(transition-colors duration-300\s*){2,}/g, 'transition-colors duration-300 ');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory('./frontend/src');
console.log('Batch mapping complete.');
