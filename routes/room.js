var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:room', function(req, res, next) {
  res.render('room', { title: 'Soveriegn Oversight' });
});

module.exports = router;
