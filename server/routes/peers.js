const router = require('express').Router();
const cache = require('memory-cache');

router.route('/').get((req, res) => {
  const peers = cache.get('peers');
  res.json(peers);
});

router.route('/').post((req, res) => {
  const id = req.body.id;
  const username = req.body.username;
  const peer = { id, username };
  const peers = cache.get('peers') || [];
  if (typeof id !== 'string' || id.length !== 16) {
    res.status(400).json('Peer ID is not valid. It should be a string at length 16!');
  } else if (typeof username !== 'string' || username.length < 3) {
    res.status(400).json('Username is not valid. It should be a string longer than 2 characters!');
  } else if (peers.find(item => item.id === peer.id)) {
    res.status(400).json('Peer ID is not unique!');
  } else {
    peers.push(peer);
    cache.put('peers', peers);
    res.status(200).json('Peer is joined network!');
  }
})

module.exports = router;