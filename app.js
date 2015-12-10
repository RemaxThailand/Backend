var http = require('http')
	, express = require('express')
	, favicon = require('serve-favicon')
	, fs = require('fs')
	, path = require('path')
	, methodOverride = require('method-override')
	, bodyParser = require('body-parser')
	, errorHandler = require('errorhandler')
	, routes = require('./routes')
	, i18n = require('i18n')	
	, cookieParser = require('cookie-parser')
	, compress = require('compression')
	, useragent = require('express-useragent')

global.config = require('./config.js');
	
i18n.configure({
	locales: ['th', 'en'],
	defaultLocale: 'th',
	directory: __dirname + '/locales'
});

var app = express();

app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/favicon.ico'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
app.use(i18n.init);
app.use(cookieParser(config.cookieSecret));
app.use(compress());
app.use(useragent.express());

if ('development' == app.get('env')) {
	app.use(errorHandler());
}

app.get('*', function(req, res) {

	if (typeof req.cookies.language == 'undefined') {
		res.cookie('language', 'th');
		res.setLocale('th');
	} else {
		res.setLocale(req.cookies.language);
	}

	var url = req.headers['uri'].split('/');
	url = url.filter(function(n){ return n !== ''; });

	if (url[0] == 'language' && url.length >= 1)
	{
		res.cookie('language', url[1]);
		req.setLocale(url[1]);
		res.redirect(req.get('referer'));
	}
	else {
		data = {};
		data.screen = (typeof req.cookies.memberKey == 'undefined' || req.cookies.memberKey == '') ? 'login' : 'index';
		data.language = req.cookies.language;
		data.memberInfo = {};
		data.memberInfo.locale = 'th';
		var ip = req.headers['x-forwarded-for'].split(',');
		data.ip = ip[0];
		data.browser = req.useragent.browser;
		data.version = req.useragent.version;
		data.platform = req.useragent.platform;
		data.os = req.useragent.os;
		if (req.useragent.isiPad) data.deviceType = 'iPad';
		else if (req.useragent.isiPod) data.deviceType = 'iPod';
		else if (req.useragent.isiPhone) data.deviceType = 'iPhone';
		else if (req.useragent.isBlackberry) data.deviceType = 'Blackberry';
		else if (req.useragent.isAndroidTablet) data.deviceType = 'Android Tablet';
		else if (req.useragent.isAndroid) data.deviceType = 'Android';
		else if (req.useragent.isDesktop) data.deviceType = 'Desktop';
		else if (req.useragent.isMobile) data.deviceType = 'Mobile';
		else if (req.useragent.isTablet) data.deviceType = 'Tablet';
		else if (req.useragent.isRaspberry) data.deviceType = 'Raspberry Pi';
		else if (req.useragent.isBot) data.deviceType = 'Bot';
		else if (req.useragent.isCurl) data.deviceType = 'Curl';
		else data.deviceType = '';
		data.webUrl = req.protocol + '://' + req.get('host') ;
		if (typeof req.cookies.memberKey != 'undefined' && req.cookies.memberKey != '') {
			var request = require('request');
			request.post({headers: { 'referer': data.webUrl }, url: config.apiUrl + '/member/exist/memberKeyAndBrowser',
				form: { apiKey: config.apiKey,
					memberKey: req.cookies.memberKey,
					ip: data.ip,
					browser: data.browser,
					version: data.version,
					platform: data.platform,
					os: data.os,
					deviceType: data.deviceType
				} 
			},
			function (error, response, body) {
				if (!error) {					
					data.json = JSON.parse(body);
					if(data.json.success){
						//res.send("Mr. Theeradej");
						data.screen = 'index';					
						//console.log(data.json);
					}
					else{
						
						data.screen = (typeof req.cookies.username != 'undefined' && req.cookies.username != '') ? 'lock' : 'login';
					}
				}
				else {
					data.screen = 'login';
					console.log(error);
				}
				
				routes.index(req, res, data);
			});
		}
		else if ( data.screen != 'login' ) {
			if ( url.length >= 1 ) {
				data.screen = url[0];
				fs.exists('./views/'+data.screen+'.jade', function (exists) {
					if (exists) {
						fs.exists('./public/javascripts/'+data.screen+'.js', function (exists) {
							data.script = (exists) ? '/javascripts/'+data.screen+'.js' : '';	
							data.subUrl = (url.length == 1 ) ? '' : url[1];
						});
					}
				});
				
				routes.index(req, res, data);
			}
		}
		else {
			
			routes.index(req, res, data);
		}
	}

});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
