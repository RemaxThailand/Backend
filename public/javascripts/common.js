var storage;
$(function() {
	
	ns=$.initNamespaceStorage('RemaxThailand');
	storage=$.localStorage;

	$('.box-tools [data-toggle="tooltip"]').tooltip({
		animated : 'fade',
		placement : 'top',
		container: 'body'
	});

	$('.hidden').removeClass('hidden').hide();

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