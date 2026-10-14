// scripts/verify_js.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let count = 0;
function checkDir(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'scratch'].includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (full.endsWith('.js') && !full.includes('.eslintrc.js')) {
      const code = fs.readFileSync(full, 'utf8');
      try {
        // Strip ES module syntax to check purely executable syntax via vm.Script
        const clean = code
          .replace(/import\s+[^;]+?;/g, '')
          .replace(/export\s+\*\s+from\s+[^;]+?;/g, '')
          .replace(/export\s+default\s+/g, '')
          .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
          .replace(/export\s+\{[^}]*\}\s*(from\s+[^;]+?)?;/g, '');
        new vm.Script(clean);
        count++;
      } catch (err) {
        console.error(`Syntax error in ${full}:`, err.message);
        process.exit(1);
      }
    }
  }
}

checkDir('E:/WeChatProjects/just-one-smoke');
console.log(`All ${count} JS files passed syntax validation!`);
