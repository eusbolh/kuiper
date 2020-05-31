const fs = require('fs');

fs.writeFile("./file4mb.js", 'export const a = "' + 'x'.repeat(4*1024*1024) + '";', (err) => {
  if (err) {
    throw (err);
  }
});

