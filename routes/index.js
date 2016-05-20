
var articles = require('../models/articles');
var mrked = require('marked');
var cookieParser = require('cookie-parser');
var routes = function(app) {
	/* GET start page. */
	app.get('/', function(req, res, next) {
		articles.articleModel.find({}).sort({_id:-1}).exec(
			function(error, result){
				if(error){
					console.log('error',error);
					res.send('error'+error);
				}else{
					var cookieUsername = req.signedCookies.username?req.signedCookies.username:null;
					res.render('start',{title:'start',result: result,cookieUsername:cookieUsername});
				}
			}
		);
	});

	/* GET home page. */
	app.get('/article', function(req, res, next) {		
		var urlPara = req.query;
		var titlePara = urlPara.title;
		articles.articleModel.findOne(
			{oTitle:titlePara},
			function(error, result){
				if(error){
					console.log('error',error);
					res.send('error'+error);
				}else{
					if(!result){
						var err = new Error('Not Found');
						err.status = 404;
						next(err);
					}else{
						var cookieUsername = req.signedCookies.username?req.signedCookies.username:null;
						res.render('article',{title:'start',result: result,mrked:mrked,cookieUsername:cookieUsername});
					}
				}
			}
		); 
	});
	
	/* GET edit page */
	app.get('/edit',function(req, res, next) {
		var articleId = req.query.articleid?req.query.articleid:null;
		if(req.signedCookies.username){
			var cookieUsername = req.signedCookies.username?req.signedCookies.username:null;
			res.render('edit',{title:'edit',cookieUsername:cookieUsername,articleId:articleId});
		}else{
			console.log('get cookie',req.signedCookies);
			res.redirect('/login');
		}
	});
	
	/* GET about page */
	app.get('/about',function(req, res, next) {
		var cookieUsername = req.signedCookies.username?req.signedCookies.username:null;
		res.render('about',{title:'about',cookieUsername:cookieUsername})
	});
	
	/* GET article manage page */
	app.get('/article-manage',function(req, res, next) {
		if(req.signedCookies.username){
			articles.articleModel.find({}).sort({_id:-1}).exec(
				function(error, result){
					if(error){
						console.log('error',error);
						res.send('error'+error);
					}else{
						var cookieUsername = req.signedCookies.username?req.signedCookies.username:null;
						res.render('articlemanage',{title:'start',result: result,cookieUsername:cookieUsername});
					}
				}
			);
		}else{
			res.redirect('/login')
		}
		
	}); 
	
	/* GET login page */
	app.get('/login',function(req, res, next) {
		var cookieUsername = req.signedCookies.username?req.signedCookies.username:null;
		res.render('login',{title:'Administrator login',cookieUsername:cookieUsername});
	});
	
	/* post login and set cookie*/
	app.post('/login',function(req, res, next) {
		var rslt = req.body;
		var account = rslt.account;
		var password = rslt.password;
		articles.accountModel.findOne({account:account},function(error,result){
			console.log(result);
			if(error||result === null){
				res.send({info: 'wrong account'});
				console.log('login find err');
			}else{
				if(result.password === password){
					console.log('password correct');
					res.cookie('username', account, {maxAge: 600000,httpOnly: true,signed:true});
					res.send({info: 'login success'});
				}else{
					console.log('incorrect password');
					res.send({info: 'incorrect password'});
				}
			}
		});
	});
	
	/* post logout and clear cookie*/
	app.post('/logout',function(req, res, next) {
		res.clearCookie('username');
		res.send({info:'cookieUsername cleared'});
	});
	
	/* post editupload */
	app.post('/editupload',function(req, res, next) {
		var newData = JSON.parse(JSON.stringify(req.body));
		var mainData = JSON.parse(newData.data);
		console.log(newData.id);
		if(newData.id !== 'null'||newData.id !== null){
			articles.articleModel.update({_id:newData.id},{$set:mainData},{upsert:true},function(err){
				if(err){
					res.send({info:'update err:'+err});
				}else{
					res.send({info:'update success'});
				}
			})
		}else{
			articles.db.collection('test').insert(mainData,function(err){
				if(err){
					res.send({info:'create err:'+err});
				}else{
					res.send({info:'creat success'});
				}
			})
		}
		
	});
	
	/* post article remove */
	app.post('/article-remove',function(req, res, next) {
		console.log(req.body);
		var article = req.body;
		articles.articleModel.remove({_id:article.articleId},function(err){
			if(err){
				res.send({info:'delete error'});
			}else{
				res.send({info:'delete success'});
			}
		})
	});
	
	/* post get article by id */
	app.post('/get-article-content',function(req, res, next){
		var articleId = req.body.id;
		articles.articleModel.findOne({_id:articleId},function(err,result){
			if(err){
				res.send({info: 'get by id err'});
			}else{
				res.send({info: 'get success',result:result})
			};
		});
	});
};

module.exports = routes;
process.on('uncaughtException',function(e){
	console.log('nodeServerProcessError: ',e)
});