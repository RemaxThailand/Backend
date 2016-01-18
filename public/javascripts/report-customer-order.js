var config;
var orderByProvinceData;

$(function() {
	loadConfig();

	google.charts.load('current', {'packages': ['geochart']});
	loadCustomerOrderByProvince();

	
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
			orderByProvinceData = data.result;
			google.charts.setOnLoadCallback(renderCustomerOrderByProvince);
			//renderCustomerOrderByProvince();
		}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}

function renderCustomerOrderByProvince() {
	$('#dv-province-chart .overlay').show();
	orderByProvinceData.sort(sort_by('month'+config.provinceMonthSelected, true, parseInt));
	$('#dv-top-sell tbody').html('');

	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'City');
	dataTable.addColumn('number', 'ยอดขาย');
	dataTable.addColumn('number', 'จำนวนบิล');

	var sum = 0;

	for(i=0; i<orderByProvinceData.length; i++){
		if ( orderByProvinceData[i]['month'+config.provinceMonthSelected] > 0 && config.provinceExcept.indexOf('|'+orderByProvinceData[i].province+'|') == -1 ) {
			dataTable.addRow( [orderByProvinceData[i].province, orderByProvinceData[i]['month'+config.provinceMonthSelected], orderByProvinceData[i]['bill'+config.provinceMonthSelected]] );
			sum += orderByProvinceData[i]['month'+config.provinceMonthSelected];
		}
		if ( i < 10 ) {
			$('#dv-top-sell tbody').append('<tr><td class="text-center">'+(i+1)+'</td>' +
				'<td><i class="show-province pointer fa '+((config.provinceExcept.indexOf('|'+orderByProvinceData[i].province+'|') == -1) ? 'fa-eye text-green' : 'fa-eye-slash text-yellow')+' padding-right-5"></i> <span class="province">'+orderByProvinceData[i].province+'</span></td>'+
				'<td class="text-right">'+numberWithCommas(orderByProvinceData[i]['month'+config.provinceMonthSelected].toFixed(0))+'</td></tr>');
		}
	}

	$('#dv-top-sell tbody').append('<tr><td colspan="2" class="text-right font-bold">'+$('#msg-total').val()+'</td><td class="text-right font-bold">'+numberWithCommas(sum.toFixed(0))+'</td></tr>');

	var options = {
		region: 'TH',
		displayMode: 'markers',
		//backgroundColor: '#ecf0f5',
		colorAxis: {colors: ['#dd4b39', '#f39c12', '#00a65a', '#3c8dbc']}
	};

	var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
	chart.draw(dataTable, options);
	
	google.visualization.events.addListener(chart, 'ready', chartLoaded);
	google.visualization.events.addListener(chart, 'select', function(){
		var selectedItem = chart.getSelection()[0];
		if (selectedItem) {
			var value = dataTable.getValue(selectedItem.row, 0);
			//alert('The user selected ' + value);
		}
	});

}

function chartLoaded() {
	$('#dv-province-chart .overlay').hide();
}

function selectHandler(e) {
	console.log( e );
	//$('#dv-province-chart .overlay').hide();
}