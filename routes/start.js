var express = require('express');
var articles = require('../models/articles');
var router = express.Router();
/* GET start page. */
router.get('/', function(req, res, next) {
	var getDb = articles.test.find(
			function(error, result){
				error?
				console.log('get db err',error):
				res.render('start', { title: 'start',result: result});
			}
		);
	
});

module.exports = router;
