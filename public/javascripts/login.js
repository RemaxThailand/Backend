$(function() {

	$('.hidden').removeClass('hidden').hide();
	$('form input').attr('disabled', '').removeAttr('disabled').removeClass('disabled');

	$(document).on('click', 'p.link', function(){
		var group = $(this).data('group');
		var sp = $(this).data('hide').split('|');
		$(this).hide();
		$('.group-'+sp[0]+', .group-'+sp[1]).hide();
		$('.group-'+group).show();
		$('.link-'+sp[0]+', .link-'+sp[1]).show();

		sp = $('title').text().split('|');
		$('title').text( $('h3.group-'+group).html() + ' |' + sp[1] );
		//console.log(  );
	});

	$(document).on('click', '#btn-signin', function(){
		var $btn = $(this).button('loading');
		$('.link-register, .link-forgot').hide();
		$('form.group-signin input').attr('disabled', 'disabled').addClass('disabled');
		$('form.group-signin .dropdown-toggle').removeAttr('data-toggle');
		//console.log( '#btn-signin' );
	});

	$(document).on('click', '#btn-register', function(){
		
		var json = {};
		json.username = $.trim($('#r-username').val());
		json.password = $.trim($('#r-password').val());
		json.mobile = $.trim($('#r-mobile').val());
		json.email = $.trim($('#r-email').val());
		
		$('#msg-error p, #msg-success p').hide();
		$('form.group-register input, #btn-register').attr('disabled','disabled');

		$.post($('#apiUrl').val()+'/member/register', {
			token: Cookies.get('token'),
			type: 'Web',
			value: JSON.stringify(json),
		}, function(data){
			if ( data.success ){
				$('p.link, #btn-register').hide();
				$('#msg-success, p.register').show();
				Cookies.set('token', data.token, { expires: 1 });
				Cookies.set('username', json.username, { expires: 365 });
				location.reload();

			}
			else {
				$('form.group-register input, #btn-register').attr('disabled', '').removeAttr('disabled');
				$('#msg-error, #'+data.error).show();
				if ( data.error == 'MBR0031' ) $('#r-username').parent().addClass('has-error');
				else if ( data.error == 'MBR0051' ) $('#r-mobile').parent().addClass('has-error');
				else if ( data.error == 'MBR0061' ) $('#r-email').parent().addClass('has-error');
			}
		}, 'json');
	});
	
	$(document).on('keyup', '#username, #password', function(e){
		if ( $('#username').val() != '' && $('#password').val() != '' 
			&& ( validateUsername($('#username').val()) || validateEmail($('#username').val()) ) ) {
			$('#btn-signin').attr('disabled', '').removeAttr('disabled').removeClass('disabled');
		}
		else {
			$('#btn-signin').attr('disabled', 'disabled').addClass('disabled');
		}
	});
	
	$(document).on('keydown', '#username, #password', function(e){
		var key = e.charCode || e.keyCode || 0;
		if (key == 13 && $('#username').val() != '' && $('#password').val() != '' ) {
			$('#btn-signin').click();
		}
	});

	$(document).on('keypress', '#r-username', function(e){
		var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
		if (validateUsername(str) || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 37 || e.keyCode == 39) {
			$('#msg-error p').hide();
			$('#r-username').parent().removeClass('has-error');
			return true;
		}
		e.preventDefault();
		return false;
	});

	$(document).on('keypress', '#r-mobile', function(e){
		var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
		if (validateNumberOnly(str) || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 37 || e.keyCode == 39) {
			$('#msg-error p').hide();
			$('#r-mobile').parent().removeClass('has-error');
			return true;
		}
		e.preventDefault();
		return false;
	});

	$(document).on('keyup', '#r-mobile', function(e){
		if ( $(this).val() != '' && validateMobile($(this).val()) ) {
			$(this).parent().removeClass('has-error');
		}
		else {
			$(this).parent().addClass('has-error');
		}
	});

	$(document).on('keyup', '#r-email', function(e){
		if ( $(this).val() != '' && validateEmail($(this).val()) ) {
			$('#msg-error p').hide();
			$(this).parent().removeClass('has-error');
		}
		else {
			$(this).parent().addClass('has-error');
		}
	});

	$(document).on('keyup', '#r-password, #r-password2', function(e){
		if ( $(this).val() != '' && $('#r-password').val() == $('#r-password2').val() ) {
			$('#r-password').parent().removeClass('has-error');
			$('#r-password2').parent().removeClass('has-error');
		}
		else {
			$('#r-password').parent().addClass('has-error');
			$('#r-password2').parent().addClass('has-error');
		}
	});
	
	$(document).on('keydown', '#r-username, #r-mobile, #r-email, #r-password, #r-password2', function(e){
		var key = e.charCode || e.keyCode || 0;
		if (key == 13 && $('#r-username').val() != '' && $('#r-mobile').val() != '' && $('#r-email').val() != '' && $('#r-password').val() != '' && $('#r-password2').val() != '') {
			$('#btn-register').click();
		}
	});
	
	$(document).on('keyup', '#r-username, #r-mobile, #r-email, #r-password, #r-password2', function(e){
		if ( $('#r-username').val() != '' && $('#r-mobile').val() != '' && $('#r-email').val() != '' && $('#r-password').val() != '' && $('#r-password2').val() != ''
			&& validateMobile($('#r-mobile').val()) && validateEmail($('#r-email').val()) && $('#r-password').val() == $('#r-password2').val() ) {
			$('#btn-register').attr('disabled', '').removeAttr('disabled').removeClass('disabled');
		}
		else {
			$('#btn-register').attr('disabled', 'disabled').addClass('disabled');
		}
	});

});

function validateEmail(str) {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(str);
}

function validateUsername(str) {
	var re = /^[a-zA-Z0-9]*$/;
	return re.test(str);
}

function validateNumberOnly(str) {
	var re = /^[0-9]*$/;
	return re.test(str);
}

function validateMobile(str) {
	//var re = /^[0]{1}+[8-9]{1}+[-\S]+[0-9]{4}+[-\S]+[0-9]{4}$/;
	var re = /^((\+)?(66)|(0))(6|8|9)(\s)?((\d{4})(\s)?(\d{4}))$/;
	var re2 = /^[0][2-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/;
	return re.test(str) || re2.test(str);
}