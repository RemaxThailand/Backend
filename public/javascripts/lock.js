var failedCount = 0;

$(function() {

	$('.hidden').removeClass('hidden').hide();
	$('form input').attr('disabled', '').removeAttr('disabled').removeClass('disabled');

	
	$(document).on('submit', 'form', function(){
		return false;
	});

	$(document).on('click', '#btn-signin', function(){
		$('#password').attr('disabled', 'disabled').addClass('disabled');
		$('#msg-error p, #msg-success p').hide();

		$.post($('#apiUrl').val()+'/member/login', {
			token: Cookies.get('token'),
			username: Cookies.get('username'),
			password: $('#password').val(),
			info: Cookies.get('info'),
			failedCount: failedCount
		}, function(data){
			if ( data.success ){
				Cookies.set('token', data.token);
				Cookies.set('username', $.trim($('#username').val()), { expires: 365 });
				location.reload();
			}
			else {
				$('#password').attr('disabled', '').removeAttr('disabled').removeClass('disabled');
				$('#msg-error, #'+data.error).show();
				failedCount++;
			}

		});
	});
	
	$(document).on('keydown', '#password', function(e){
		$('#msg-error p, #msg-success p').fadeOut();
		var key = e.charCode || e.keyCode || 0;
		if (key == 13 && $('#username').val() != '' && $('#password').val() != '' ) {
			$('#btn-signin').click();
		}
	});

});