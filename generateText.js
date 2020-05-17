const fs = require('fs');

fs.writeFile("./text1.js", 'export const a = "' + 'x'.repeat(10*1024*1024) + '";', (err) => {
  if (err) {
    throw (err);
  }
});

