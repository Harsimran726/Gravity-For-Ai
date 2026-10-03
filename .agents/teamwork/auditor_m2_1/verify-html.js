const fs = require('fs');
const path = require('path');

function searchHtml(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      searchHtml(full);
    } else if (item.name.endsWith('.html')) {
      console.log(full);
    }
  }
}

searchHtml(path.resolve(process.cwd(), '.next'));
