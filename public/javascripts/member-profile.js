$(function() {

	$(document).on('focus', '.fm-change_data input.form-control', function(){
		$(this).attr('data-tmp', $.trim($(this).val()));
	});

	$(document).on('blur', '.fm-change_data input.form-control', function(){
		$(this).val($.trim($(this).val()));
		if ($(this).val() != $(this).attr('data-tmp') ) {
			updateInfo( $(this).parents('.box'), $(this).attr('id'), $(this).val() );
		}
	});

	$(document).on('change', '#male, #female', function(){
		if(document.getElementById("male").checked)
			updateInfo( $(this).parents('.box'), 'gender', 1 );
		else if(document.getElementById("female").checked)
			updateInfo( $(this).parents('.box'), 'gender', 0 );
	});
	
	$('#male').on('checked', function(){
		updateInfo( $(this).parents('.box'), 'gender', 1 );
	});
	
	$('#female').on('checked', function(){
		updateInfo( $(this).parents('.box'), 'gender', 0 );
	});

	$(document).on('click', '#btn-change_password', function(){
		$('#dv-password span').hide();
		if ( $('#old_password').val() == '' || $('#password').val() == '' || $('#password2').val() == '' ) {
			$('#sp-pleaseFillAll').show().parents('.box-footer').show();
		}
		else if ( $('#password').val() != $('#password2').val() ) {
			$('#sp-passwordDifferent').show().parents('.box-footer').show();
		}
		else {
			$(this).parents('.box-body').slideUp();
			$('#sp-loadingData').show().parents('.box-footer').show();

			$.post($('#apiUrl').val()+'/member/update/password', {
				token: Cookies.get('token'),
				currentPassword: $('#old_password').val(),
				newPassword: $('#password').val(),
			}, function(data){
				if (data.success) {
					$('#dv-password span').hide();
					if ( data.result[0].returnCode == 0 ) {
						$('#sp-currentPasswordInvalid').show().parents('.box-footer').show();
						$('#btn-change_password').parents('.box-body').slideDown();
					}
					else if ( data.result[0].returnCode == 1 ) $('#sp-changePasswordSuccess').show().parents('.box-footer').show();
				}
				else {
					console.log( data.error );
				}
			}, 'json');

		}
	});

});


function updateInfo( box, column, value ){
	box.find('.box-footer .success, .box-footer .error').hide();
	box.find('.box-footer').show().find('.loading').show();

	$.post($('#apiUrl').val()+'/member/update/info', {
		token: Cookies.get('token'),
		column: column,
		value: value,
	}, function(data){
		if (data.success) {
			box.find('.box-footer .error, .box-footer .loading').hide();
			box.find('.box-footer').show().find('.success').show();
		}
		else {
			box.find('.box-footer .manualMessage').html(' '+data.error);
			box.find('.box-footer .success, .box-footer .loading').hide();
			box.find('.box-footer').show().find('.error').show();
		}
	}, 'json');
}