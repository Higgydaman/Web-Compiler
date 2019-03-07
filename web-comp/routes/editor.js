var express = require('express');
var router = express.Router();

/* GET the code editor */
router.get('/', function(req, res, next) {
  res.render('editor', { title: 'Express' });
});

module.exports = router;