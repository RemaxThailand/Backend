exports.index = function(req, res, data){
	/*if (data.screen == 'member') {
		data.title = 'Member - ' + data.title;
		data.titleDescription += 'ข้อมูลสมาชิกทั่วไป';
	}*/

	res.render(data.screen, { data: data });

};