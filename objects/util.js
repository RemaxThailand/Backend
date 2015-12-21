exports.getBrowserInfo = function(req) {
	var data = {};
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

	return data;
};