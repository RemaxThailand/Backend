var storage;
var device = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) ? 'mobile' : 'desktop';
$(function() {
	
	ns=$.initNamespaceStorage('RemaxThailand');
	storage=$.localStorage;

	$('.box-tools [data-toggle="tooltip"]').tooltip({
		animated : 'fade',
		placement : 'top',
		container: 'body'
	});

	$('.hidden').removeClass('hidden').hide();

	if ( $('#menu-cart').length > 0 ) loadBadge( 'menu-cart', 'bg-red' );
	if ( $('#subMenu-sales-order').length > 0 ) loadBadge( 'subMenu-sales-order', 'bg-red' );

});

function numberWithCommas(x) {
	try
	{
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	catch(err) {
		return x;
	}
}

var sort_by = function(field, reverse, primer){
   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}

jQuery.fn.ForceNumericOnly = function() {
	return this.each(function() {
		$(this).keydown(function(e) {
			if (/^[0-9]+$/.test($(this).val()) == false) {
				var text = $(this).val();
				$(this).val( text.substr(0, text.length-1) );
			}
			var key = e.charCode || e.keyCode || 0;
			return (
				(
					key == 13 || // Enter
					key == 8 || // Back Space
					(key >= 48 && key <= 57 && e.shiftKey== false) || // 0-9
					(key >= 96 && key <= 105) // 0-9 (Numpad)
				) && ( $(this).val().length == 0 || (/^[0-9]+$/.test($(this).val())) )
			);
		}),
		$(this).keyup(function(e) {
			if (/^[0-9]+$/.test($(this).val()) == false) {
				var text = $(this).val();
				$(this).val( text.substr(0, text.length-1) );
			}
		});
	});
};

function loadBadge( name, color ) {
	$.post($('#apiUrl').val()+'/member/summary/alert', {
		token: Cookies.get('token'),
		screen: name,
	}, function(data){
			if (data.success) {
				if (data.result[0].count > 0){
					$('#'+name+' .badge').addClass(color).html( numberWithCommas(data.result[0].count) ).show();
					if (name.indexOf('subMenu-') != -1) {
						var parent = $('#'+name+' .badge').parents('.treeview').find('.badge:eq(0)');
						parent.addClass(color).html( numberWithCommas(data.result[0].count+parseInt($.trim(parent.html())) ) ).show();
					}
				}
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}