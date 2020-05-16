const router = require('express').Router();

router.route('/').get((req, res) => {
  res.json('Get request is successful!');
});

module.exports = router;