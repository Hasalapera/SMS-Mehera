const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Fix opacity modifiers that were broken by previous script
      content = content.replace(/bg-primary transition-all duration-300\/([0-9]+)/g, 'bg-primary/$1 transition-all duration-300');
      content = content.replace(/text-primary transition-all duration-300\/([0-9]+)/g, 'text-primary/$1 transition-all duration-300');
      content = content.replace(/border-primary transition-all duration-300\/([0-9]+)/g, 'border-primary/$1 transition-all duration-300');
      
      content = content.replace(/bg-card transition-colors duration-300\/([0-9]+)/g, 'bg-card/$1 transition-colors duration-300');
      content = content.replace(/bg-background transition-colors duration-300\/([0-9]+)/g, 'bg-background/$1 transition-colors duration-300');
      
      content = content.replace(/text-textMain transition-colors duration-300\/([0-9]+)/g, 'text-textMain/$1 transition-colors duration-300');
      content = content.replace(/border-border transition-colors duration-300\/([0-9]+)/g, 'border-border/$1 transition-colors duration-300');
      
      // Also catch transition-all vs transition-colors mixups with opacity
      content = content.replace(/bg-card transition-all duration-300\/([0-9]+)/g, 'bg-card/$1 transition-all duration-300');
      
      // Deduplicate transitions
      content = content.replace(/(transition-colors duration-300\s*){2,}/g, 'transition-colors duration-300 ');
      content = content.replace(/(transition-all duration-300\s*){2,}/g, 'transition-all duration-300 ');
      content = content.replace(/transition-all duration-300 transition-colors duration-300/g, 'transition-all duration-300');
      content = content.replace(/transition-colors duration-300 transition-all duration-300/g, 'transition-all duration-300');
      content = content.replace(/transition-colors duration-300 transition-colors/g, 'transition-colors duration-300');
      content = content.replace(/transition-all duration-300 transition-colors/g, 'transition-all duration-300');

      // Fix layout backgrounds that were missed
      content = content.replace(/bg-\[#F9F9F9\]/g, 'bg-background transition-all duration-300');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned up: ${fullPath}`);
      }
    }
  }
}

processDirectory('./frontend/src');
console.log('Cleanup complete.');
