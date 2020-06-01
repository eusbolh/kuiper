const fs = require('fs');
const readline = require('readline');
const util = require('util');

const readInterface = readline.createInterface({
  input: fs.createReadStream('./kuiper.kunnect.co-1590959447759 (me to baris).log'),
  output: process.stdout,
  terminal: false,
});

const result = {
  peers: [],
  timeToConnectServer: null,
  transfers: {},
};

readInterface.on('line', (line) => {
  const words = line.split(' ');
  switch (words[0]) {
    case 'App.jsx:72':
      // Server connection
      result.timeToConnectServer = words[5];
      break;
    case 'App.jsx:30':
      // Peer connection
      const peer = {
        id: words[4].substr(1, words[4].length-1),
        time: words[6],
      };
      result.peers.push(peer);
      break;
    case 'App.jsx:146':
      // File transfer
      const fileSize = `${words[10]} ${words[11]}`;
      const transfer = {
        time: words[1],
        id: words[13],
      };
      if (!result.transfers[fileSize]) {
        result.transfers[fileSize] = [];
      }
      result.transfers[fileSize].push(transfer);
      break;
    default:
      break;
  }
});

readInterface.on('close', () => {
  console.log(util.inspect(result, false, null, true));
});
