const fs = require('fs');

fs.readFile('./www.bloomberg.com.har', 'utf-8', (err, plain) => {
  processFileSummaryBySize(JSON.parse(plain).log);
});

const processFileDetailed = (data) => {
  if (!data || !data.entries) {
    return;
  }
  const files = {};
  data.entries.map((entry) => {
    if (entry.request && entry.request.method === 'GET') {
      const content = entry.response.content;
      const file = {
        size: (content.size / 1024).toFixed(3),
        time: entry.time.toFixed(3),
      };
      if (!files[content.mimeType]) {
        files[content.mimeType] = [file];
      } else {
        files[content.mimeType].push(file);
      }
    }
  });
  console.log(files);
}

const processFileSummaryByType = (data) => {
  if (!data || !data.entries) {
    return;
  }
  const files = {};
  data.entries.map((entry) => {
    if (entry.request && entry.request.method === 'GET') {
      const content = entry.response.content;
      if (!files[content.mimeType]) {
        files[content.mimeType] = {
          '0KB': { count: 0, average: 0 },
          '1KB': { count: 0, average: 0 },
          '2KB': { count: 0, average: 0 },
          '4KB': { count: 0, average: 0 },
          '8KB': { count: 0, average: 0 },
          '16KB': { count: 0, average: 0 },
          '32KB': { count: 0, average: 0 },
          '64KB+': { count: 0, average: 0 },
        };
      }
      const fileSize = (content.size / 1024).toFixed(0);
      const bucket = Math.pow(2, Math.ceil(Math.log(fileSize)/Math.log(2)));
      if (bucket >= 64) {
        files[content.mimeType]['64KB+'] = {
          count: files[content.mimeType]['64KB+'].count + 1,
          average: ((files[content.mimeType]['64KB+'].average * files[content.mimeType]['64KB+'].count + entry.time) / (files[content.mimeType]['64KB+'].count + 1)).toFixed(3), 
        };
      } else {
        files[content.mimeType][`${bucket}KB`] = {
          count: files[content.mimeType][`${bucket}KB`].count + 1,
          average: ((files[content.mimeType][`${bucket}KB`].average * files[content.mimeType][`${bucket}KB`].count + entry.time) / (files[content.mimeType][`${bucket}KB`].count + 1)).toFixed(3), 
        };
      }
    }
  });
  console.log(files);
}

const processFileSummaryBySize = (data) => {
  if (!data || !data.entries) {
    return;
  }
  const files = {
    '0KB': { count: 0, average: 0 },
    '1KB': { count: 0, average: 0 },
    '2KB': { count: 0, average: 0 },
    '4KB': { count: 0, average: 0 },
    '8KB': { count: 0, average: 0 },
    '16KB': { count: 0, average: 0 },
    '32KB': { count: 0, average: 0 },
    '64KB+': { count: 0, average: 0 },
  };
  data.entries.map((entry) => {
    if (entry.request && entry.request.method === 'GET') {
      const content = entry.response.content;
      const fileSize = (content.size / 1024).toFixed(0);
      const bucket = Math.pow(2, Math.ceil(Math.log(fileSize)/Math.log(2)));
      if (bucket >= 64) {
        files['64KB+'] = {
          count: files['64KB+'].count + 1,
          average: ((files['64KB+'].average * files['64KB+'].count + entry.time) / (files['64KB+'].count + 1)).toFixed(3), 
        };
      } else {
        files[`${bucket}KB`] = {
          count: files[`${bucket}KB`].count + 1,
          average: ((files[`${bucket}KB`].average * files[`${bucket}KB`].count + entry.time) / (files[`${bucket}KB`].count + 1)).toFixed(3), 
        };
      }
    }
  });
  console.log(files);
}