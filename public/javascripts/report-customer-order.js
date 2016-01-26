var config;

$(function() {
	loadConfig();

	google.charts.load('current', {'packages': ['geochart']});
	loadCustomerOrderByProvince();
	loadCustomerOrder();
	loadThailandInfo();

	$('#dv-top-sell select').val( config.provinceMonthSelected );
	
	$(document).on('click', '#dv-top-sell .show-province', function(){
		if ( $(this).hasClass('fa-eye') ) {
			$(this).removeClass('fa-eye').removeClass('text-green').addClass('fa-eye-slash').addClass('text-yellow');
			config.provinceExcept += $(this).parent().find('.province').html()+'|';
		}
		else {
			$(this).addClass('fa-eye').removeClass('text-yellow').removeClass('fa-eye-slash').addClass('text-green');
			config.provinceExcept = config.provinceExcept.replace('|'+$(this).parent().find('.province').html()+'|', '|');
		}
		storage.set('ConfigScreenReportCustomerOrder', config);
		renderCustomerOrderByProvince();
	});

	$(document).on('click', '#dv-top-sell .select-month option', function(){
		config.provinceMonthSelected = $(this).data('month');
		storage.set('ConfigScreenReportCustomerOrder', config);
		renderCustomerOrderByProvince();
	});

	$(document).on('click', '#dv-top-sell .province', function(){
		renderOrderData( $(this).data('key') );
	});


});

function loadConfig() {
	config = storage.get('ConfigScreenReportCustomerOrder');
	if ( config == undefined ) {
		config = {};
		config.provinceExcept = '|กรุงเทพมหานคร|';
		config.provinceMonthSelected = '0';
		storage.set('ConfigScreenReportCustomerOrder', config);
	}
}

function loadCustomerOrderByProvince() {
	$.post($('#apiUrl').val()+'/order/history/province', { token: Cookies.get('token')	}, function(data) {
		if (data.success) {
			storage.set('DataScreenReportCustomerOrder-HistoryByProvince', JSON.stringify(data.result));
			google.charts.setOnLoadCallback(renderCustomerOrderByProvince);
			//renderCustomerOrderByProvince();
		}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}

function loadCustomerOrder() {
	$.post($('#apiUrl').val()+'/order/history/customer', { token: Cookies.get('token')	}, function(data) {
		if (data.success) {
			storage.set('DataScreenReportCustomerOrder-HistoryByCustomer', JSON.stringify(data.result));
			//orderByProvinceData = data.result;
			//google.charts.setOnLoadCallback(renderCustomerOrderByProvince);
			//renderCustomerOrderByProvince();
		}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}

function loadThailandInfo() {
	if ( storage.get('ThailandRegion') == undefined ) {
		$.post($('#apiUrl').val()+'/province/thailandInfo', { token: Cookies.get('token')	}, function(data) {
			if (data.success) {
				storage.set('ThailandRegion', JSON.stringify(data.result[0]));
				//storage.set('ThailandDistrict', JSON.stringify(data.result[2]));

				var json = {}
				for(i=0; i<data.result[1].length; i++){
					json[data.result[1][i].id] = {};
					json[data.result[1][i].id].nameTh = data.result[1][i].nameTh;
					json[data.result[1][i].id].nameEn = data.result[1][i].nameEn;
					json[data.result[1][i].id].region = '|'+data.result[1][i].region+'|'+
						(data.result[1][i].region1 == null ? '' : data.result[1][i].region1+'|')+
						(data.result[1][i].region2 == null ? '' : data.result[1][i].region2+'|');
				}
				storage.set('ThailandProvince', JSON.stringify(json));

				json = {}
				for(i=0; i<data.result[1].length; i++){
					json[data.result[1][i].nameTh] = data.result[1][i].id;
					json[data.result[1][i].nameEn] = data.result[1][i].id;
				}
				storage.set('ThailandProvinceKey', JSON.stringify(json));
				
				json = {}
				for(i=0; i<data.result[2].length; i++){
					var id = data.result[2][i].id+'-'+data.result[2][i].province;
					json[id] = {};
					json[id].nameTh = data.result[2][i].nameTh;
					json[id].nameEn = data.result[2][i].nameEn;
					json[id].zipcode = data.result[2][i].zipcode;
				}
				storage.set('ThailandDistrict', JSON.stringify(json));

			}
		}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
	}
}

function renderCustomerOrderByProvince() {
	$('#dv-province-chart .overlay, #dv-top-sell .overlay').show();
	$('#dv-customer_history').slideUp();

	var data = storage.get('DataScreenReportCustomerOrder-HistoryByProvince');
	data.sort(sort_by('month'+config.provinceMonthSelected, true, parseInt));
	$('#dv-top-sell tbody').html('');

	var province = storage.get('ThailandProvince');
	var provinceKey = storage.get('ThailandProvinceKey');
	var nameKey = $('#lang').val() == 'en' ? 'nameEn' : 'nameTh';

	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'City');
	dataTable.addColumn('number', $('#dv-customer_history th.th-total').html() );
	dataTable.addColumn('number', $('#dv-customer_history th.th-bill').html() );

	var sum = 0;

	for(i=0; i<data.length; i++){
		if ( data[i]['month'+config.provinceMonthSelected] > 0 && config.provinceExcept.indexOf('|'+data[i].province+'|') == -1 ) {
			dataTable.addRow( [province[provinceKey[data[i].province]][nameKey], data[i]['month'+config.provinceMonthSelected], data[i]['bill'+config.provinceMonthSelected]] );
			sum += data[i]['month'+config.provinceMonthSelected];
		}
		if ( i < 10 ) {
			if ( data[i]['bill'+config.provinceMonthSelected] > 0 )
				$('#dv-top-sell tbody').append('<tr><td class="text-center">'+(i+1)+'</td>' +
					'<td><i class="show-province pointer fa '+((config.provinceExcept.indexOf('|'+data[i].province+'|') == -1) ? 'fa-eye text-green' : 'fa-eye-slash text-yellow')+' padding-right-5"></i> '+
					'<span class="province pointer" data-key="'+provinceKey[data[i].province]+'">'+province[provinceKey[data[i].province]][nameKey]+'</span></td>'+
					'<td class="text-right">'+numberWithCommas(data[i]['month'+config.provinceMonthSelected].toFixed(0))+'</td></tr>');
		}
	}

	$('#dv-top-sell tbody').append('<tr><td colspan="2" class="text-right font-bold">'+$('#msg-total').val()+'</td><td class="text-right font-bold">'+numberWithCommas(sum.toFixed(0))+'</td></tr>');

	var options = {
		region: 'TH',
		displayMode: 'markers',
		//backgroundColor: '#f9f9f9',
		colorAxis: {colors: ['#dd4b39', '#f39c12', '#00a65a', '#3c8dbc']}
	};

	var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
	chart.draw(dataTable, options);
	
	google.visualization.events.addListener(chart, 'ready', chartLoaded);
	google.visualization.events.addListener(chart, 'select', function(){
		var selectedItem = chart.getSelection()[0];
		if (selectedItem) {
			var json = storage.get('ThailandProvinceKey');
			renderOrderData( json[dataTable.getValue(selectedItem.row, 0)] );
		}
	});

}

function chartLoaded() {
	$('#dv-province-chart .overlay, #dv-top-sell .overlay').hide();
	$('#dv-top-sell').show();
}

function renderOrderData( province ) {
	var data = storage.get('DataScreenReportCustomerOrder-HistoryByCustomer');
	data.sort(sort_by('month'+config.provinceMonthSelected, true, parseInt));
	
	var district = storage.get('ThailandDistrict');
	var nameKey = $('#lang').val() == 'en' ? 'nameEn' : 'nameTh';

	$('#dv-customer_history tbody').html('');

	var html = '';
	var idx = 1;
	for(i=0; i<data.length; i++){
		if ( data[i].province == province && data[i]['bill'+config.provinceMonthSelected] > 0) {
			var districtName = district[data[i].district+'-'+province][nameKey];
			html += '<tr><td>'+(idx++)+'</td><td>'+data[i].member+'</td><td>'+data[i].name+'</td><td>'+data[i].shop+'</td><td>'+data[i].mobile+'</td><td>'+
			(districtName == null ? district[data[i].district+'-'+province].nameTh : districtName)
			+'</td><td class="text-center">'+data[i].sellPrice+'</td>' + 
				'<td class="text-center">'+data[i]['bill'+config.provinceMonthSelected]+'</td><td class="text-right">'+numberWithCommas(data[i]['month'+config.provinceMonthSelected].toFixed(0))+'</td></tr>';
		}
	}
	$('#dv-customer_history tbody').html( html )
	$('#dv-customer_history').slideDown();
}