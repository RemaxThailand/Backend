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

var sort_by = function(field, reverse, primer){
   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}