var firstLoad = true;

$(function() {

	loadCartDetail();
	loadProvince();

	$('#txt-tel').ForceNumericOnly();
	$('#txt-zipcode').ForceNumericOnly();

	if (device == 'desktop') {
		$('#tb-sum_price').scrollToFixed({ marginTop: 10 });
	}

	$(document).on('shown.bs.popover', '.td-image', function(){
		$('img.lazy').lazyload({
			effect : "fadeIn"
		});
	});

	$(document).on('click', '.txt-qty', function(){
		$(this).select();
	});	

	$(document).on('change', '.txt-qty', function(){
		var qty = 0;
		try {
			qty = parseInt( $(this).val() );

			if ( qty == 0 ) {
				$(this).parents('tr').remove();
				var count = parseInt( $('#menu-cart .badge').html().replace(',', '') );
				$('#menu-cart .badge').html( numberWithCommas(count-1) ).show();
				if ( count == 0 ) $('#menu-cart .badge').hide();
			}
			
			$.post($('#apiUrl').val()+'/order/update', {
				authKey: $('#authKey').val(),
				productCode: $(this).parents('tr').attr('id'),
				qty: qty,
			}, function(data){
					if (data.success) {
						loadCartDetail();
					}
			}, 'json');
			
			$('.td-price').html('<i class="fa fa-spin fa-refresh"></i>');

		}
		catch(err) {
		}
		
	});

	$(document).on('change', '#province', function(){
		loadDistrict();
	});

	$(document).on('change', '#district', function(){
		loadZipCode();
	});

	$(document).on('click', '#btn-save_address', function(){
		var isComplete = true;
		$('#address_edit .txt-require').each(function(){
			$(this).val( $.trim($(this).val()) );
			if ( $(this).val() == '' ) {
				$(this).parents('.form-group').addClass('has-error');
				$(this).focus();
				isComplete = false;
				return false;
			}
			else {
				$(this).parents('.form-group').removeClass('has-error');
			}
		});

		if (isComplete) {
			getAddress();
			//$('#btn-edit_address').hide();
		}

	});

	$(document).on('click', '#btn-edit_address', function(){
		$('#tb-result').parents('.table-responsive').hide();
		$('#address_sum, #btn-confirm').hide();
		$('#address_edit').show();
	});

	$(document).on('click', '#btn-confirm', function(){
		$('#tb-result').parents('.table-responsive').hide();
		$('#btn-confirm').parents('tr').hide();
		$('#dv-address').hide();
		$('#menu-cart .badge').hide();
		$('#dv-loading-confirm').show();
	});

	$(document).on('click', '#btn-confirm', function(){
		confirmOrder();
	});

	$(document).on('click', '#btn-apply_coupon', function(){		
		$(this).button('loading');
		$('#txt-coupon').attr('disabled', 'disabled');
		$('.b-coupon').html(' ' + $.trim($('#txt-coupon').val()) + ' ');

		$.post($('#apiUrl').val()+'/order/coupon/info', {
			authKey: $('#authKey').val(),
			couponCode: $.trim($('#txt-coupon').val()),
		}, function(data){
			$('#btn-apply_coupon').button('reset');
			$('#txt-coupon').attr('disabled', '').removeAttr('disabled').val('');
			if (data.success) {
				if (data.correct) {
					if ( data.result[0] != undefined ) {
						$('#tr-coupon').show();
						$('.price-coupon').html( '<b>' + data.result[0].discount + '</b>' );
						$('.unit-coupon').attr('data-unit', data.result[0].discountType ).html( ' ' + (data.result[0].discountType == 'B' ? $('#msg-baht').val() : '%') );
						$('#dv-coupon_success').show();
						$('#dv-coupon_fail').hide();
						$('.price-total').html( numberWithCommas(parseInt($('.price-total:eq(0)').attr('data-total'))-data.result[0].discount) );
					}
					else {
						$('#tr-coupon').hide();
						$('#dv-coupon_success').hide();
						$('#dv-coupon_fail').show();
						$('.price-total').html( numberWithCommas(parseInt($('.price-total:eq(0)').attr('data-total'))) );
					}
				}
			}
		}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
	});

});

function loadCartDetail(){
	$.post($('#apiUrl').val()+'/order/cart/detail', {
		authKey: $('#authKey').val(),
	}, function(data){

			loadCartSummary();

			if (data.success) {
				if (data.correct) {
					var html = '';
					for( i=0; i<data.result.length; i++ ) {
						var result = data.result[i];
						html += '<tr id="' + result.id + '">';
						html += '<td nowrap="nowrap" class="text-right">' + (i+1) + '</td>';
						html += '<td><i class="pointer text-muted fa fa-photo td-image" data-container="body" data-toggle="popover" data-placement="top" data-content="<img class=\'lazy\' data-original=\'' + ((result.image != null) ? result.image : 'https://cdn24fin.blob.core.windows.net/img/products/1/Logo/1_s.png') + '\' src=\'https://cdn24fin.blob.core.windows.net/img/products/1/Logo/loading.gif\' width=\'100\'>"></i> ';
						html += '<span class="product">' + result.name + '</span></td>';
						html += '<td class="text-right">' + numberWithCommas(result.price) + '</td>';
						html += '<td><input class="form-control input-sm text-right text-red font-bold txt-qty" type="text" style="width: 50px; height: 20px; border-width:1px; padding:2px" value="' + result.qty + '"></td>';
						html += '<td class="text-right">' + numberWithCommas(result.price*result.qty) + '</td>';
						html += '</tr>';
					}

					$('#tb-result tbody').html(html);
					$('.td-image').popover({
						html: true,
						trigger: 'hover',
					});
					$('.txt-qty').ForceNumericOnly();

					if ( html != '' ) {
						$('.wait').show();
					}
					else {
						$('#dv-no_data').show();
						$('.content.invoice').hide();
					}
					$('#dv-loading').hide();

				}

			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}

function loadAddress(){
	$.post($('#apiUrl').val()+'/member/address/data', {
		authKey: $('#authKey').val(),
	}, function(data){
			if (data.success) {
				if (data.correct) {
					$('#txt-firstname').val( data.result[0].firstname );
					$('#txt-lastname').val( data.result[0].lastname );
					$('#txt-nickname').val( data.result[0].contactName );
					$('#txt-tel').val( data.result[0].mobile );
					$('#txt-shop').val( data.result[0].shopName );
					$('#txt-address').val( data.result[0].address );
					$('#txt-address2').val( data.result[0].address2 );
					$('#txt-sub_district').val( data.result[0].subDistrict );
					$('#district').attr('data-selected', data.result[0].district).attr('data-zipcode', data.result[0].zipCode);
					$('#province').val( data.result[0].province ).attr('data-selected', data.result[0].province);
					$('#txt-zipcode').val( data.result[0].zipCode );
				}
			}
			else {
			}
			loadDistrict();
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}



function loadCartSummary(){
	$.post($('#apiUrl').val()+'/order/cart/summary', {
		authKey: $('#authKey').val(),
	}, function(data){
			if (data.success) {
				if (data.correct) {
					if (data.result[0].items > 0){
						$('.price-product').html( numberWithCommas(data.result[0].price) );
						$('.price-shipping').html( (data.result[0].shipping > 0) ? numberWithCommas(data.result[0].shipping) : '-' );
						var total = data.result[0].price+data.result[0].shipping;
						if ( data.result[0].sellDiscount > 0) {
							$('.txt-discount_percent').html( '(' + numberWithCommas(data.result[0].sellDiscount)+'%)' );
							var  discount = Math.floor(data.result[0].price*data.result[0].sellDiscount/100);
							$('.price-discount').html( '-' + numberWithCommas( discount ) );
							total -= discount;
						}
						else {
							$('.price-discount').html( '-' );
						}
						$('.price-total').html( numberWithCommas(total) ).attr('data-total', total);
					}
				}
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}


function loadProvince(){
	$.post($('#apiUrl').val()+'/master/thailand/province', {
		language: $('#language').val(),
	}, function(data){
			if (data.success) {
				if (data.correct) {
					var html = '';
					for( i=0; i<data.result.length; i++ ) {
						var result = data.result[i];
						html += '<option value="'+ result.id +'"'+ 
							((result.name == $('#province').attr('data-selected') || ($('#province').attr('data-selected') == '' && result.id == '1')) ? ' selected' : '')
							+'>'+ result.name +'</option>';
					}
					$('#province').html( html );
					loadAddress();
				}
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}


function loadDistrict(){
	$.post($('#apiUrl').val()+'/master/thailand/district', {
		language: $('#language').val(),
		provinceCode: $('#province :selected').val(),
	}, function(data){
			if (data.success) {
				if (data.correct) {
					var html = '';
					for( i=0; i<data.result.length; i++ ) {
						var result = data.result[i];
						html += '<option value="'+ result.id +'" data-zipcode="'+ result.zipCode +'"'+ 
							((result.id == $('#district').attr('data-selected') && result.zipCode == $('#district').attr('data-zipCode')) ? ' selected' : '')
							+'>'+ result.name +'</option>';
					}
					$('#district').html( html );
					loadZipCode();
				}
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}


function loadZipCode(){
	$('#txt-zipcode').val( $('#district :selected').attr('data-zipcode') );
	if (firstLoad) {
		getAddress();
	}
}

function getAddress() {
	var isComplete = true;
	$('#address_edit .txt-input').each(function(){
		$(this).val( $.trim($(this).val()) );
		if ( $(this).val() == '' && $(this).hasClass('txt-require') ) {
			isComplete = false;
		}
		else {
			$('.'+$(this).attr('id')).html( $(this).val() );
		}
	});

	if (isComplete) {
		var isBkk = $('#province :selected').val() == '1';
		$('.txt-sub_district').text( ((isBkk) ? $('#msg-kwang').val() : $('#msg-tambon').val() ) + (( $('#language').val() == 'en' ) ? ' ' : '') + $('.txt-sub_district').text() );
		$('.txt-district').text( ((isBkk) ? $('#msg-khet').val() : $('#msg-amphoe').val()) + (( $('#language').val() == 'en' ) ? ' ' : '') + $('#district :selected').text() );
		$('.txt-province').text( ((isBkk) ? '' : (( $('#language').val() == 'en' ) ? $('#province :selected').text()+' '+$('#msg-province').val() : $('#msg-province').val() + $('#province :selected').text()) ) );
		if ( $('.txt-tel').text().length == 10 ) {
			var mobile = $('.txt-tel').text();
			$('.txt-tel').html( mobile.substr(0, 3)+'-'+mobile.substr(3, 4)+'-'+mobile.substr(7, 3) );
		}

		$('#tb-result').parents('.table-responsive').show();
		$('#address_sum, #btn-confirm').show();
		$('#address_edit').hide();
	}
	else {
		if ( !firstLoad ) {
			$('#tb-result').parents('.table-responsive').hide();
		}
		$('#address_sum, #btn-confirm').hide();
		$('#address_edit').show();
	}

	firstLoad = false;
	return isComplete;
}

function confirmOrder(){
	$.post($('#apiUrl').val()+'/member/address/add', {
		authKey: $('#authKey').val(),
		firstname: $.trim($('#txt-firstname').val()),
		lastname: $.trim($('#txt-lastname').val()),
		contactName: $.trim($('#txt-nickname').val()),
		mobilePhone: $.trim($('#txt-tel').val()),
		shopName: $.trim($('#txt-shop').val()),
		address: $.trim($('#txt-address').val()),
		address2: $.trim($('#txt-address2').val()),
		subDistrict: $.trim($('#txt-sub_district').val()),
		districtCode: $.trim($('#district :selected').val()),
		provinceCode: $.trim($('#province :selected').val()),
		zipcode: $.trim($('#txt-zipcode').val()),
	}, function(data){
			if (data.success) {
				generateOrder();
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}

function generateOrder(){
	$('#txt-coupon').parents('tr').hide();
	$.post($('#apiUrl').val()+'/order/confirm', {
		authKey: $('#authKey').val(),
		coupon: ($('#dv-coupon_success').css('display') == 'none') ? '' : $.trim($('.b-coupon:eq(0)').html()),
	}, function(data){
			if (data.success) {
				if (data.correct) {
					$('#dv-loading-confirm').hide();
					$('#dv-coupon_success').parents('tr').hide();
					$('.dv-success').show();
					$('#expireHours').html( data.result[0].orderExpireHours );
					$('#h-orderNo').html( data.result[0].orderNo );
				}
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}