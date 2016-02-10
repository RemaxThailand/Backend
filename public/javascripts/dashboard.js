$(function() {

	if ( $('#numberOrderHistory').length > 0 ) loadCount('member-order_history');

	$(document).on('click', 'a.order_history', function(){
		if ($('#numberOrderHistory').html() != '0') {
			loadOrderHistory();
		}
	});

});


function loadCount( screen ) {
	$.post($('#apiUrl').val()+'/member/summary/alert', {
		token: Cookies.get('token'),
		screen: screen,
	}, function(data){
			if (data.success) {
				if (data.result[0].count > 0){
					$('#numberOrderHistory').html( data.result[0].count );
				}
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}


function loadOrderHistory() {
	$.post($('#apiUrl').val()+'/member/order/history', {
		token: Cookies.get('token')
	}, function(data){
			if (data.success) {
				$('.box.order_history').slideDown();
					var tbody = $('.box.order_history').find('table tbody');
					tbody.html('');
					var html = '';
					//var sumPrice = 0;
					for(i=0; i<data.result.length; i++){
						var result = data.result[i];
						html += '<tr><td'+((!result.active) ? ' class="msg_erase"' : '')+'><a href="https://24fin-api.azurewebsites.net/report/order4customer/1/'+result.orderNo+'">'+result.orderNo+'</a></td>';
						html += '<td class="text-center'+((!result.active) ? ' msg_erase' : '')+'">'+moment(result.orderDate).utcOffset(0).format('DD/MM/YYYY HH:mm')+'</td>';
						html += '<td>';
						if (!result.active) html += '<span class="label label-default">'+$('#msg-cancel').val()+'</span>';
						else {
							html += '<i class="fa fa-lg pointer fa-bitcoin show-tooltip '+((result.isPay) ? 'text-success' : 'text-muted')+'" data-toggle="tooltip" data-placement="top" title="'+((result.isPay) ? $('#msg-paid').val() : $('#msg-unpaid').val())+'"></i>';
							html += ' <i class="fa fa-lg pointer fa-cube show-tooltip '+((result.isPack) ? 'text-success' : 'text-muted')+'" data-toggle="tooltip" data-placement="top" title="'+((result.isPack) ? $('#msg-pack').val() : $('#msg-unpack').val())+'"></i>';
							html += ' <i class="fa fa-lg pointer fa-truck show-tooltip '+((result.isShip) ? 'text-success"  data-target="#dv-input_shipping" data-toggle="modal"' : 'text-muted')+' data-toggle="tooltip" data-placement="top" title="'+((result.isShip) ? $('#msg-shipped').val() : $('#msg-awaiting_shipment').val())+'" data-orderNo="'+result.orderNo+'" data-shippingType="'+(result.shippingType == null ? '' : result.shippingType)+'" data-shippingCode="'+(result.shippingCode == null ? '' : result.shippingCode)+'"></i>';
							if ( !result.isPay ) {
								html += ' <span class="label label-info">'+$('#msg-awaiting_payment').val()+'</span>';
							}
							else if ( result.isPay && !result.isPack ) {
								html += ' <span class="label label-info">'+$('#msg-awaiting_stock').val()+'</span>';
							}
							//sumPrice += result.totalPrice;
						}
						html += '</td>';
						html += '<td class="text-center">'+result.cnt+'</td>';
						html += '<td class="text-center">'+result.qty+'</td>';
						html += '<td class="text-right">'+numberWithCommas(result.totalPrice.toFixed(0))+'</td>';		
						html += '<td class="text-right">'+numberWithCommas(result.shippingPrice.toFixed(0))+'</td>';		
						html += '<td class="text-right '+((result.isPay) ? 'text-primary font-bold' : 'text-muted')+((!result.active) ? ' msg_erase' : '')+'">'+numberWithCommas((result.totalPrice+result.shippingPrice).toFixed(0))+'</td>';						
					}
					//html += '<tr><td colspan="5" class="text-right">'+$('#msg-total').val()+'</td><td class="text-right text-primary font-bold">'+numberWithCommas(sumPrice.toFixed(0))+'</td></tr>';
					tbody.html(html);
					$('.show-tooltip').tooltip();
					$('i.text-muted').css('opacity', 0.3);
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}