var http = require('http')
	, express = require('express')
	, favicon = require('serve-favicon')
	, fs = require('fs')
	, path = require('path')
	, methodOverride = require('method-override')
	, bodyParser = require('body-parser')
	, errorHandler = require('errorhandler')
	, i18n = require('i18n')	
	, cookieParser = require('cookie-parser')
	, compress = require('compression')
	, useragent = require('express-useragent')
	, jwt = require('jsonwebtoken')
	, routes = require('./routes')
	, request = require('request')

global.config = require('./config.js');
	
i18n.configure({
	locales: ['th', 'en'],
	defaultLocale: 'th',
	directory: __dirname + '/locales'
});

var app = express();
var maxAge = 365 * 24 * 60 * 60 * 1000;

app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/favicon.ico'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: maxAge }));
app.use(i18n.init);
app.use(cookieParser(config.publicKey));
app.use(compress());
app.use(useragent.express());

if ('development' == app.get('env')) {
	app.use(errorHandler());
}

app.get('*', function(req, res) {

	//res.setHeader("Access-Control-Allow-Headers", "x-access-token, mytoken");

	if (typeof req.cookies.language == 'undefined') {
		res.cookie('language', 'th');
		res.setLocale('th');
	} else {
		res.setLocale(req.cookies.language);
	}

	var url = req.url.split('/');
	url = url.filter(function(n){ return n !== ''; });
	if (url.length == 0) url[0] = '';
	
	data = {};
	data.webUrl = 'https://'+req.headers['x-host'];

	if (url.length >= 1 && url[0] == 'language')
	{
		res.cookie('language', url[1], { maxAge: maxAge });
		req.setLocale(url[1]);
		res.redirect(req.get('referer'));
	}
	else if (url.length >= 1 && url[0] == 'logout')
	{
		res.clearCookie('token');
		if (typeof url[1] != 'undefined' && url[1] == 'refresh' ) res.clearCookie('username');
		res.redirect( data.webUrl );
	}
	else if (url.length >= 1 && url[0] == 'updateRole')
	{
		request.post({headers: { 'referer': data.webUrl }, url: config.apiUrlLocal + '/member/update/role',
			form: { token: req.cookies.token,
				role: url[1]
			} 
		},
		function (error, response, body) {
			if (!error) {
				data.json = JSON.parse(body);
				if(data.json.success){
				}
				else {
					console.log(data.json);
				}
			}
			else {
				console.log(error);
			}
			res.redirect(req.get('referer'));
		});
	}
	else {
		data.screen = (typeof req.cookies.memberKey == 'undefined' || req.cookies.memberKey == '') ? 'login' : 'index';
		data.language = req.cookies.language;
		data.username = req.cookies.username;
		data.memberInfo = {};

		if (typeof req.cookies.info == 'undefined' || req.cookies.info == '') {
			var util = require('./objects/util');
			data.browserInfo = util.getBrowserInfo(req);
			res.cookie('info', jwt.sign(data.browserInfo, config.secretKey), { maxAge: maxAge });
		}

		if (typeof req.cookies.token == 'undefined' || req.cookies.token == '') {
			request.post({headers: { 'referer': data.webUrl }, url: config.apiUrlLocal + '/api/token/request',
				form: { apiKey: config.apiKey,
					secretKey: config.secretKey
				} 
			},
			function (error, response, body) {
				if (!error) {
					data.json = JSON.parse(body);
					if(data.json.success){
						res.cookie('token', data.json.token, { maxAge: maxAge });
					}
					else {
						console.log(data.json);
					}
				}
				else {
					console.log(error);
				}
				data.screen = (typeof req.cookies.username != 'undefined' && req.cookies.username != '') ? 'lock' : 'login';
				routes.index(req, res, data);
			});
		}
		else {
			request.post({headers: { 'referer': data.webUrl }, url: config.apiUrlLocal + '/member/info',
				form: { token: req.cookies.token } 
			},
			function (error, response, body) {
				if (!error) {
					data.json = JSON.parse(body);
					if(data.json.success){
						data.memberInfo = data.json.memberInfo;
						data.memberInfo.displayName = data.json.memberInfo.firstname || data.json.memberInfo.username;
						data.menu = data.json.screen;
						data.memberType = data.json.memberType;
						data.screen = (typeof url[0] != 'undefined' && url[0] != '') ? ((typeof url[1] != 'undefined' && url[1] != '') ? url[0]+'-'+url[1] : url[0]) : 'dashboard';

						if ( data.screen != 'dashboard' && JSON.stringify(data.menu).indexOf('"/'+ data.screen.replace('-','/') +'"') == -1 ) data.screen = 'permission';
						fs.exists('./views/'+data.screen+'.jade', function (exists) {
							if (!exists) data.screen = 'dashboard';
							fs.exists('./public/javascripts/'+data.screen+'.js', function (exists) {
								data.hasScript = exists;
								if ( data.screen == 'admin-member' ) {
									exports.memberList(req, res, data, routes);
								}
								else {
									routes.index(req, res, data);
								}
							});
							
						});
					}
					else{
						data.screen = (typeof req.cookies.username != 'undefined' && req.cookies.username != '') ? 'lock' : 'login';
						routes.index(req, res, data);
					}
				}
				else {
					data.screen = (typeof req.cookies.username != 'undefined' && req.cookies.username != '') ? 'lock' : 'login';
					routes.index(req, res, data);
					console.log(error);
				}
				
			});
		}
	}

});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

exports.memberList = function(req, res, data, routes) {
	
	request.post({headers: { 'referer': data.webUrl }, url: config.apiUrlLocal + '/member/list',
		form: { token: req.cookies.token } 
	},
	function (error, response, body) {
		if (!error) {
			var json = JSON.parse(body);
			data.result = json.result;
		}
		routes.index(req, res, data);
	});
}