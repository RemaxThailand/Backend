var config;
var categoryData;
var productData;
var renderCategoryDone = false;

$(function() {

	// ย่อเมนูด้านซ้าย
	$('body').addClass('sidebar-collapse');
	// Fix เมนูรถเข็นให้อยู่ด้านบนเสมอ
	$('#dv-cart').scrollToFixed({ marginTop: 10 });

	// โหลดค่า Config	
	//loadConfig(); // โหลด config ก่อน ไม่ได้ค่า  config.category เลยย้ายไปทำหลัง renderCategory แล้ว
		
	// โหลดข้อมูล Category
	loadCategory();
	
	
	$(document).on('click', '#ul-category li.category', function() { // ถ้าเลือก Category
		var $obj = $(this);
		var category = $obj.data('id');
		$('.brand').hide();
		$('.cat-'+category).show();
		$('.category i.fa-check-circle').removeClass('fa-check-circle').addClass('fa-chevron-circle-right');
		$('.category').removeClass('font-bold active');
		$('li.brand a').removeClass('text-red font-bold');
		$obj.addClass('font-bold').addClass('active')
			.find('i').removeClass('fa-chevron-circle-right').addClass('fa-check-circle');

		// Tab แสดง Brand
		$('#tab .brand').remove();
		$('.cat-'+category).each(function(){
			$('#tab').append('<li class="brand brand-' + $(this).data('id') + '" data-id="' + $(this).data('id') + '"><a href="javascript:void(0)">' + $(this).find('a span').html() + '</a></li>')
		});

		/*$('#tab li').hide();
		$('#ul-category li.brand.cat-' + category).each( function(){
			$('#tab li.brand-'+$(this).data('id')).show();
		});

		$('#tab li.active').removeClass('active font-bold');
		$('#tab li.brand-').addClass('active font-bold').show();
		*/

		$('#dv-header').html( $obj.find('span').text()+' <span><small></small></span><span><small> : <b class="countItem">0</b> ' + $('#msg-items').val() + '</small></span>' );

		config.category = category;
		config.brand = "";
		storage.set('ConfigScreenProduct', config);
		renderProduct();

	});
	
	
	$(document).on('click', '#ul-category li.brand', function(){ //ถ้าเลือก Brand
		var $obj = $(this);
		var brand = $obj.data('id');
		$('#ul-category li.brand a').removeClass('text-red font-bold');
		$(this).find('a').addClass('text-red font-bold');
		
		$('#tab li.active').removeClass('active font-bold');
		$('#tab li.brand-'+$(this).data('id')).addClass('active font-bold');

		$('#dv-header small:eq(0)').html( '<i class="fa fa-angle-right"></i> ' + $(this).find('span').text() );
		config.brand = brand;
		storage.set('ConfigScreenProduct', config);
		renderProduct();
	});
	
	$(document).on('click', '#tab li', function(){ //ถ้าเลือก Brand ที่ Tab
		var $obj = $(this);
		var brand = $obj.data('id');
		$('#ul-category li.brand a').removeClass('text-red font-bold');
		$('#ul-category li.brand-' + $(this).data('id') + ' a').addClass('text-red font-bold');

		$('#tab li.active').removeClass('active font-bold');
		$('#tab li.brand-'+$(this).data('id')).addClass('active font-bold');

		if ($(this).hasClass('brand-')) {
			$('#dv-header small:eq(0)').html('');
		}
		else {
			$('#dv-header small:eq(0)').html( '<i class="fa fa-angle-right"></i> ' + $(this).find('a').text() );
		}

		config.brand = brand;
		storage.set('ConfigScreenProduct', config);
		renderProduct();

	});
	
	$(document).on('click', '#btn-list-view', function(){ //แสดงข้อมูลแบบตาราง
		if ($(this).hasClass('active')) {
			$(this).removeClass('active btn-primary').addClass('btn-default');
			$('#btn-box-view').addClass('active btn-primary').removeClass('btn-default');
			//$('#dv-box').show();
			//$('.table-responsive').hide();
			config.view = 'box';
			storage.set('ConfigScreenProduct', config);
			renderProduct();
		}
		else {
			$(this).addClass('active btn-primary').removeClass('btn-default');
			$('#btn-box-view').removeClass('active btn-primary').addClass('btn-default');
			//$('.table-responsive').show();
			//$('#dv-box').hide();
			config.view = 'table';
			storage.set('ConfigScreenProduct', config);
			renderProduct();
		}

	});
	
	$(document).on('click', '#btn-box-view', function(){ //แสดงข้อมูลแบบกล่อง
		if ($(this).hasClass('active')) {
			$(this).removeClass('active btn-primary').addClass('btn-default');
			$('#btn-list-view').addClass('active btn-primary').removeClass('btn-default');
			//$('.table-responsive').show();
			//$('#dv-box').hide();
			config.view = 'table';
			storage.set('ConfigScreenProduct', config);
			renderProduct();
		}
		else {
			$(this).addClass('active btn-primary').removeClass('btn-default');
			$('#btn-list-view').removeClass('active btn-primary').addClass('btn-default');
			//$('#dv-box').show();
			//$('.table-responsive').hide();
			config.view = 'box';
			storage.set('ConfigScreenProduct', config);
			renderProduct();
		}

	});
	
	$(document).on('click', '#cb-show_image', function(){ //จะแสดงรูปภาพหรือไม่ 
		if ($(this).hasClass('active')) {
			$(this).removeClass('active btn-primary').addClass('btn-default');
			$('.td-thumb, .dv-thumb').hide();
			config.showImage = false;
			storage.set('ConfigScreenProduct', config);
		}
		else {
			$(this).addClass('active btn-primary').removeClass('btn-default');
			$('.td-thumb, .dv-thumb').show();
			config.showImage = true;
			storage.set('ConfigScreenProduct', config);
		}

	});
	
	$(document).on('keyup', '#txt-search', function(){
		searchProduct();
	});
	
	//แสดงปุ่มสั่งซื้อ
	$(document).on('mouseover', '.tr-brand', function(){
		$(this).find('.btn-add_cart').show();
	});

	$(document).on('mouseout', '.tr-brand', function(){
		$(this).find('.btn-add_cart').hide();
	});

	$(document).on('mouseover', '.dv-thumb', function(){
		$(this).find('.btn-add_cart_box').show();
	});

	$(document).on('mouseout', '.dv-thumb', function(){
		$(this).find('.btn-add_cart_box').hide();
	});
	
	$('#dv-view_image').on('hidden.bs.modal', function (e) {
		$('#dv-view_image .carousel-indicators, #dv-view_image .carousel-inner').html('');
		$('#carousel-product').removeClass('carousel').removeClass('slide');
	});
	
	$(document).on('click', '.zoom', function(){
		var $obj = $(this).parents('.product-row');
		var dimg = $(this).attr('data-image').split(',');
		var dataImage = "";
		for(i=0;i<dimg.length;i++)
			dataImage += (dimg[i].toLowerCase().substr(0,1) != 'd') ? dimg[i]+',' : '';
		
		/* console.log(dataImage.substr(0,dataImage.length-1)) 
		console.log($obj.find('.sku').text())
		console.log($obj.find('.name').text()) 
		console.log($(this).attr('data-id')) */
		
		// showProductImage(Producname, SKU, ID, Image) ส่งไปเพื่อเปิด carousel
		showProductImage($obj.find('.name').text(),$obj.find('.sku').text(),$(this).attr('data-id'),dataImage.substr(0,dataImage.length-1));
	}); 
	
	//เมื่อกดปุ่มบันทึกจำนวนสินค้า
	$(document).on('click', '.btn-save', function(){
		var qty = 0;
		try {
			qty = parseInt( $(this).parents('.input-group').find('.txt-qty').val() )
			console.log(qty)
		}
		catch(err) {
		}
		
		/* if (qty > 0) {
			$.post($('#apiUrl').val()+'/order/cart/update', {
				token: Cookies.get('token'),
				memberKey: $('#authKey').val(),
				product: productCode,
				qty: qty,
			}, function(data){
					if (data.success) {						
						if (data.result[0].items > 0){
							$('#items').html( numberWithCommas(data.result[0].items) );
							$('#pieces').html( numberWithCommas(data.result[0].qty) );
							$('#totalPrice').html( numberWithCommas(data.result[0].price) );
							$('.sp-no_item').hide();
							$('.sp-has_item').show();
							$('#menu-cart .badge').addClass('bg-red').html( numberWithCommas(data.result[0].items) ).show();
						}

						if (data.result[0].remain == 0) {
							$('.btn-product-'+data.result[0].product).remove();
							$('.no-stock-'+data.result[0].product).show();
						}
					}

					$('#dv-cart').css('background', '#ffcc99');
					setTimeout(function(){
						$('#dv-cart').stop().css('background', 'white');
					}, 1000);

			}, 'json');
		} */
		$('#dv-add_cart').modal('hide');
		$('#dv-view_image').modal('hide');
	});

});

function isNumeric(input) {
    return (input - 0) == input && (''+input).trim().length > 0;
}

function loadConfig() {
	config = storage.get('ConfigScreenProduct');
	if ( config == undefined ) {
		config = {};
		config.category = $('#ul-category .category:eq(0)').data('id');
		config.brand = "";
		config.view = 'box';
		config.showImage = true;
		storage.set('ConfigScreenProduct', config);
		
		$('#btn-box-view').addClass('btn-primary active').removeClass('btn-default');
		$('#cb-show_image').addClass('btn-primary active').removeClass('btn-default');
	} else {
			if ( config.showImage)
				$('#cb-show_image').addClass('btn-primary active').removeClass('btn-default');
			if ( config.view == 'box' )
				$('#btn-box-view').addClass('btn-primary active').removeClass('btn-default');
			else
				$('#btn-list-view').addClass('btn-primary active').removeClass('btn-default');
	}
	// Set ค่าปุ่มที่ User เคยกด
	
	
	if(renderCategoryDone){ // เมื่อ renderCategory เสร็จ ทำโหลดสินค้า สินค้าจะ render ตาม category ที่เลือก
		loadProduct();
	}
	else{
		loadCategory();
	}
		
}

function loadCategory() {
	$.post($('#apiUrl').val()+'/product/category_and_brand', { token: Cookies.get('token')	}, function(data) {
			if (data.success) {
				categoryData = data.result;
				renderCategory();
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}

function loadProduct() {
	$.post($('#apiUrl').val()+'/product/all', { token: Cookies.get('token')	}, function(data) {
			if (data.success) {
				productData = data.result;
				$('#category' + config.category).click();
				renderProduct();
			}
	}, 'json').fail( function(xhr, textStatus, errorThrown) { console.log(xhr.statusText); });
}


function renderCategory() {
	for( i=0; i<categoryData.length; i++ ) {
		var result = categoryData[i];
		var htmlBrand = '';
		if (result.brand != undefined)
		{
			for( j=0; j<result.brand.length; j++ ) {
				var brand = result.brand[j];
				htmlBrand += '<li class="brand hidden cat-' + result.id + ' brand-' + brand.id + '" data-id="' + brand.id + '"><a href="javascript:void(0)" class="padding-left-30"><i class="fa fa-caret-right"></i> <span>' + brand.name + '</span></a></li>';
			}
		}
		$('#ul-category').append('<li id="category' + result.id + '" class="category" data-id="' + result.id + '"><a href="javascript:void(0)"><i class="fa fa-chevron-circle-right"></i> <span>' + result.name + '</span></a>' + ((htmlBrand != '') ? htmlBrand : '') + '</li>');
		$('.hidden').removeClass('hidden').hide();
	}
	renderCategoryDone = true;
	loadConfig(); // config จะมีผลกับ renderProduct
}

function renderProduct() {
	var html = '';
	for( i=0; i<productData.length; i++ ) {
		result = productData[i];
		result.hasStock = ((productData[i].qty - productData[i].onCart - productData[i].onOrder) > 0) ? 1 : 0;

		if ( result.category === config.category ) {
			if ( config.brand === "" ){
				if ( config.view === 'box' ) {
					html += '<div data-id="' + result.id + '" class="product-row col-xs-12 col-sm-6 col-md-4 col-lg-4 margin-bottom-15 dv-cat-' + result.category + ' dv-brand-'+result.brand+' dv-brand">';
					html += '<div class="dv-box well well_thin well_white">';
					html += '<div class="dv-thumb margin-bottom-5 padding-top-5 text-center">';
					//html += '<img data-id="' + result.id + '" class="img-product lazy img-responsive img-rounded'+((result.imageMedium != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((result.imageMedium != null) ? result.imageMedium : 'https://src.remaxthailand.co.th/img/product/default.jpg') + '" src="https://src.remaxthailand.co.th/img/product/default.jpg">';

					if ( result.image != undefined ) {
						var sp = result.image.split(',');
						html += '<img data-id="' + result.id + '" data-image="'+ result.image +'" class="img-product lazy img-responsive img-rounded'+((sp[0] != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((sp[0]!= null) ? 'https://img.remaxthailand.co.th/300x300/product/'+result.sku+'/'+sp[0]+'' : 'https://src.remaxthailand.co.th/img/product/default.jpg') + '" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=300>';
					}
					else {
						html += '<img data-id="' + result.id + '" class="img-product lazy img-responsive img-rounded" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=300>';
					}
					
					if (($('#role').val() == 'dealer' || $('#role').val() == 'member') && result.hasStock == 1) {
						html += '<button class="btn-product-' + result.id + ' btn-add_cart_box btn btn-warning btn-sm btn-center hidden" data-toggle="modal" data-target="#dv-add_cart">' + $('#msg-orderNow').val() + '</button>';
					}
					html += '<span class="no-stock-' + result.id + ' btn-center text-no_stock text-red font-bold' + ((result.hasStock == 1) ? ' hidden' : '') + '" style="text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;"><i class="fa fa-warning"></i> ' + $('#msg-outOfStock').val() + '</span>';
					
					html += '</div>';
					html += '<div><small class="pull-left text-muted">SKU : <b class="sku">'+result.sku+'</b>';
					html += ((result.isNew == 1) ? ' <img class="img-up" src="/images/icons/new.gif">' : '') + '</small>';
					html += (result.warranty != 0) ? '<small class="pull-right text-muted">' + $('#msg-warranty').val() + ' <b>' + ((result.warranty >= 365) ? (result.warranty/365)+' '+$('#msg-year').val() : ((result.warranty >= 30) ? (result.warranty/30)+ ' ' + $('#msg-month').val() : result.warranty + ' ' +$('#msg-day').val())) + '</b></small>' : '';
					html += '<div class="clearfix"></div><div class="text-'+((result.isNew == 1) ? 'red' : 'light-blue')+' font-bold name" style="min-height:48px">' + result.name;
					html += '</div><div class="line"></div>';
					
					/*if ( result.wholesalePrice1 == undefined ) {
						html += '<div class="pull-left font-sm">' + $('#msg-retailPrice').val() + ' : <b class="font-bigger font-bold text-green">' + numberWithCommas(result.retailPrice) + '</b></div>';
					}

					if ( result.wholesalePrice != undefined ) {
						html += '<div class="pull-right font-sm">' + $('#msg-wholesalePrice').val() + ' : <b class="font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice) + '</b></div>';
					}*/

					if ( result.price != undefined ) {
						html += '<div class="pull-left font-sm">' + $('#msg-price').val() + ' : <b class="font-bigger font-bold text-green">' + numberWithCommas(result.price) + '</b></div>';
						html += '<div class="pull-right font-sm"><b class="font-bigger font-bold text-red">' + numberWithCommas(result.price1) + '</b> <i class="img-up fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty1 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i> / <b class="font-bigger font-bold text-red">' + numberWithCommas(result.price2) + '</b> <i class="img-up fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty2 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i></div>';
					}

					if ( result.price1 != undefined ) {
						if ( result.stock != undefined ) {
							html += '<div class="pull-right font-sm">' + $('#msg-remain').val() + ' : <b class="font-bigger text-yellow">' + numberWithCommas(result.stock) + '</b></div>';
						}
						html += '<div class="pull-right font-sm"></div>';
						html += '<div class="clearfix"></div><div class="font-sm">' + $('#msg-wholesalePrice').val() + ' : <span class="font-bigger">' + numberWithCommas(result.price1) + '</span>';
					}
					if ( result.price2 != undefined ) {
						//html += ' / <span class="font-bigger">' + numberWithCommas(result.price2) + '</span>';
						html += ' / <span class="font-bigger">' + numberWithCommas(result.price2) + '</span></div>';
					}
					/*if ( result.price3 != undefined ) {
						html += ' / <span class="font-bigger' + (($('#role').val() == 'sale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price3) + '</span>' + (($('#role').val() == 'sale') ? '</div>' : '') + '';
					}
					if ( result.price4 != undefined ) {
						html += ' / <span class="font-bigger' + (($('#role').val() == 'headSale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price4) + '</span>' + (($('#role').val() == 'headSale') ? '</div>' : '') + '';
					}
					if ( result.price5 != undefined ) {
						html += ' / <span class="font-bigger' + (($('#role').val() == 'manager') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price5) + '</span>' + (($('#role').val() == 'manager') ? '</div>' : '') + '';
					}*/

					if ( result.onCart != undefined ) {
						if ( result.onCart > 0 || result.onOrder > 0 ) {
							html += '<div class="font-sm text-muted"><span' + ((result.onCart != 0) ? ' class="text-red"' : '') + '>' + $('#msg-itemOnCart').val() + ' : <b>' + result.onCart + '</b></span> / <span' + ((result.onOrder != 0) ? ' class="text-red"' : '') + '>' + $('#msg-onOrder').val() + ' : <b' + ((result.onOrder != 0) ? ' class="font-bigger text-red"' : '') + '>' + result.onOrder + '</b></span></div>';
						}
					}
					
					html += '<div class="clearfix"></div>';
					html += '</div></div></div>';
				
				} else {
					html += '<tr data-id="' + result.id + '" id="sku-' + result.sku + '" class="product-row tr-cat-' + result.category + ' tr-brand-'+result.brand+' tr-brand  font-normal">';
					//html += '<td class="td-thumb padding-left-0"><img data-id="' + result.id + '" class="img-product img-thumbnail lazy'+((result.image != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((result.image != null) ? result.image : 'https://cdn24fin.blob.core.windows.net/img/products/1/Logo/1_s.jpg') + '" src="https://cdn24fin.blob.core.windows.net/img/products/1/Logo/1_s.jpg" width="100"></td>';
					
					if ( result.image != undefined ) {
						var sp = result.image.split(',');
						html +=  '<td class="td-thumb padding-left-0"><img data-id="' + result.id + '" data-image="'+ result.image +'" class="img-product img-responsive img-thumbnail lazy'+((sp[0] != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((sp[0] != null) ? 'https://img.remaxthailand.co.th/100x100/product/'+result.sku+'/'+sp[0]+'' : 'https://src.remaxthailand.co.th/img/product/default.jpg') + '" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=100>';
					}
					else {
						html += '<td class="td-thumb padding-left-0"><img data-id="' + result.id + '" class="img-product img-responsive img-thumbnail" data-target="#dv-view_image" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=100>';
					}
					
					html += '<td><span class="text-'+((result.isNew == 1) ? 'red' : 'light-blue')+' font-bold name">' + result.name + '</span>';
					html += (result.isNew == 1) ? ' <img src="/images/icons/new.gif">' : '';
					html += '<br>';
					html += (result.sku != null) ? 'SKU : <b class="sku">' + result.sku + '</b>' : '';
					html += (result.warranty != 0) ? ' &nbsp; ' + $('#msg-warranty').val() + ' : <b>' + ((result.warranty == 365) ? '1 '+$('#msg-year').val() : ((result.warranty >= 30) ? (result.warranty/30)+ ' ' + $('#msg-month').val() : result.warranty + ' ' +$('#msg-day').val())) + '</b>' : '';
					html += '<br>';
					
					if (($('#role').val() == 'dealer' || $('#role').val() == 'member') && result.hasStock == 1) {
						html += '<button class="btn-product-' + result.id + ' btn-add_cart btn btn-sm btn-warning' + ((device == 'desktop') ? ' hidden' : '') + '" data-target="#dv-add_cart" data-toggle="modal">' + $('#msg-orderNow').val() + '</button>';
					}
					
					html += '<span class="no-stock-' + result.id + ' font-sm text-no_stock text-red font-bold' + ((result.hasStock == 1) ? ' hidden' : '') + '"><i class="fa fa-warning"></i> ' + $('#msg-outOfStock').val() + '</span>';
					

					if ( result.onCart != undefined ) {
						if ( result.onCart > 0 || result.onOrder > 0 ) {
							html += '<br><span class="font-sm text-muted"><span' + ((result.onCart != 0) ? ' class="text-red"' : '') + '>' + $('#msg-itemOnCart').val() + ' : <b>' + result.onCart + '</b></span> / <span' + ((result.onOrder != 0) ? ' class="text-red"' : '') + '>' + $('#msg-onOrder').val() + ' : <b' + ((result.onOrder != 0) ? ' class="font-bigger text-red"' : '') + '>' + result.onOrder + '</b></span></span>';
						}
					}

					html += '</td>';
					if ( result.stock != undefined ) {
						$('#tb-result thead .stock').show();
						html += '<td class="text-right font-bigger text-yellow">' + ((result.stock > 0) ? numberWithCommas(result.stock) : '-' )+ '</td>';
					}

					html += '<td class="text-right font-bigger font-bold text-green">' + numberWithCommas(result.price) + '</td>';

					/*if ( result.wholesalePrice != undefined ) {
						$('#tb-result thead .wholesalePrice').show();
						html += '<td class="text-right font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice) + '</td>';
					}
					if ( result.wholesalePrice1 != undefined ) {
						$('#tb-result thead .wholesalePrice1').show();
						html += '<td class="text-right"><span class="font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice1) + 
							'</span> <i class="fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty1 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i></td>';
					}
					if ( result.wholesalePrice2 != undefined ) {
						$('#tb-result thead .wholesalePrice2').show();
						html += '<td class="text-right"><span class="font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice2) + 
							'</span> <i class="fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty2 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i></td>';
					}*/

					if ( result.price1 != undefined ) {
						$('#tb-result thead .price1').show();
						html += '<td class="text-right font-bigger">' + numberWithCommas(result.price1) + '</td>';
					}
					if ( result.price2 != undefined ) {
						$('#tb-result thead .price2').show();
						html += '<td class="text-right font-bigger">' + numberWithCommas(result.price2) + '</td>';
					}
					/*if ( result.price3 != undefined ) {
						$('#tb-result thead .price3').show();
						html += '<td class="text-right font-bigger' + (($('#role').val() == 'sale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price3) + '</td>';
					}
					if ( result.price4 != undefined ) {
						$('#tb-result thead .price4').show();
						html += '<td class="text-right font-bigger' + (($('#role').val() == 'headSale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price4) + '</td>';
					}
					if ( result.price5 != undefined ) {
						$('#tb-result thead .price5').show();
						html += '<td class="text-right font-bigger' + (($('#role').val() == 'manager') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price5) + '</td>';
					}*/
					html += '</tr>';
				}
			}
			else if ( result.brand === config.brand ){
				if ( config.view === 'box' ) {
					html += '<div data-id="' + result.id + '" data-image="'+ result.image +'" class="product-row col-xs-12 col-sm-6 col-md-4 col-lg-4 margin-bottom-15 dv-cat-' + result.category + ' dv-brand-'+result.brand+' dv-brand">';
					html += '<div class="dv-box well well_thin well_white">';
					html += '<div class="dv-thumb margin-bottom-5 padding-top-5 text-center">';
					//html += '<img data-id="' + result.id + '" class="img-product lazy img-responsive img-rounded'+((result.imageMedium != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((result.imageMedium != null) ? result.imageMedium : 'https://src.remaxthailand.co.th/img/product/default.jpg') + '" src="https://src.remaxthailand.co.th/img/product/default.jpg">';

					if ( result.image != undefined ) {
						var sp = result.image.split(',');
						html += '<img data-id="' + result.id + '" class="img-product lazy img-responsive img-rounded'+((sp[0] != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((sp[0]!= null) ? 'https://img.remaxthailand.co.th/300x300/product/'+result.sku+'/'+sp[0]+'' : 'https://src.remaxthailand.co.th/img/product/default.jpg') + '" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=300>';
					}
					else {
						html += '<img data-id="' + result.id + '" class="img-product lazy img-responsive img-rounded" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=300>';
					}
					
					if (($('#role').val() == 'dealer' || $('#role').val() == 'member') && result.hasStock == 1) {
						html += '<button class="btn-product-' + result.id + ' btn-add_cart_box btn btn-warning btn-sm btn-center hidden" data-toggle="modal" data-target="#dv-add_cart">' + $('#msg-orderNow').val() + '</button>';
					}
					html += '<span class="no-stock-' + result.id + ' btn-center text-no_stock text-red font-bold' + ((result.hasStock == 1) ? ' hidden' : '') + '" style="text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;"><i class="fa fa-warning"></i> ' + $('#msg-outOfStock').val() + '</span>';

					html += '</div>';
					html += '<div><small class="pull-left text-muted">SKU : <b class="sku">'+result.sku+'</b>';
					html += ((result.isNew == 1) ? ' <img class="img-up" src="/images/icons/new.gif">' : '') + '</small>';
					html += (result.warranty != 0) ? '<small class="pull-right text-muted">' + $('#msg-warranty').val() + ' <b>' + ((result.warranty >= 365) ? (result.warranty/365)+' '+$('#msg-year').val() : ((result.warranty >= 30) ? (result.warranty/30)+ ' ' + $('#msg-month').val() : result.warranty + ' ' +$('#msg-day').val())) + '</b></small>' : '';
					html += '<div class="clearfix"></div><div class="text-'+((result.isNew == 1) ? 'red' : 'light-blue')+' font-bold name" style="min-height:48px">' + result.name;
					html += '</div><div class="line"></div>';
					
					/*if ( result.wholesalePrice1 == undefined ) {
						html += '<div class="pull-left font-sm">' + $('#msg-retailPrice').val() + ' : <b class="font-bigger font-bold text-green">' + numberWithCommas(result.retailPrice) + '</b></div>';
					}

					if ( result.wholesalePrice != undefined ) {
						html += '<div class="pull-right font-sm">' + $('#msg-wholesalePrice').val() + ' : <b class="font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice) + '</b></div>';
					}*/

					if ( result.price != undefined ) {
						html += '<div class="pull-left font-sm">' + $('#msg-price').val() + ' : <b class="font-bigger font-bold text-green">' + numberWithCommas(result.price) + '</b></div>';
						html += '<div class="pull-right font-sm"><b class="font-bigger font-bold text-red">' + numberWithCommas(result.price1) + '</b> <i class="img-up fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty1 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i> / <b class="font-bigger font-bold text-red">' + numberWithCommas(result.price2) + '</b> <i class="img-up fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty2 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i></div>';
					}

					if ( result.price1 != undefined ) {
						if ( result.stock != undefined ) {
							html += '<div class="pull-right font-sm">' + $('#msg-remain').val() + ' : <b class="font-bigger text-yellow">' + numberWithCommas(result.stock) + '</b></div>';
						}
						html += '<div class="pull-right font-sm"></div>';
						html += '<div class="clearfix"></div><div class="font-sm">' + $('#msg-wholesalePrice').val() + ' : <span class="font-bigger">' + numberWithCommas(result.price1) + '</span>';
					}
					if ( result.price2 != undefined ) {
						//html += ' / <span class="font-bigger">' + numberWithCommas(result.price2) + '</span>';
						html += ' / <span class="font-bigger">' + numberWithCommas(result.price2) + '</span></div>';
					}
					/*if ( result.price3 != undefined ) {
						html += ' / <span class="font-bigger' + (($('#role').val() == 'sale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price3) + '</span>' + (($('#role').val() == 'sale') ? '</div>' : '') + '';
					}
					if ( result.price4 != undefined ) {
						html += ' / <span class="font-bigger' + (($('#role').val() == 'headSale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price4) + '</span>' + (($('#role').val() == 'headSale') ? '</div>' : '') + '';
					}
					if ( result.price5 != undefined ) {
						html += ' / <span class="font-bigger' + (($('#role').val() == 'manager') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price5) + '</span>' + (($('#role').val() == 'manager') ? '</div>' : '') + '';
					}*/

					if ( result.onCart != undefined ) {
						if ( result.onCart > 0 || result.onOrder > 0 ) {
							html += '<div class="font-sm text-muted"><span' + ((result.onCart != 0) ? ' class="text-red"' : '') + '>' + $('#msg-itemOnCart').val() + ' : <b>' + result.onCart + '</b></span> / <span' + ((result.onOrder != 0) ? ' class="text-red"' : '') + '>' + $('#msg-onOrder').val() + ' : <b' + ((result.onOrder != 0) ? ' class="font-bigger text-red"' : '') + '>' + result.onOrder + '</b></span></div>';
						}
					}
					
					html += '<div class="clearfix"></div>';
					html += '</div></div></div>';
				
				} else {
					html += '<tr data-id="' + result.id + '" id="sku-' + result.sku + '" class="product-row tr-cat-' + result.category + ' tr-brand-'+result.brand+' tr-brand  font-normal">';
					//html += '<td class="td-thumb padding-left-0"><img data-id="' + result.id + '" class="img-product img-thumbnail lazy'+((result.image != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((result.image != null) ? result.image : 'https://cdn24fin.blob.core.windows.net/img/products/1/Logo/1_s.jpg') + '" src="https://cdn24fin.blob.core.windows.net/img/products/1/Logo/1_s.jpg" width="100"></td>';
					
					if ( result.image != undefined ) {
						var sp = result.image.split(',');
						html +=  '<td class="td-thumb padding-left-0"><img data-id="' + result.id + '" data-image="'+ result.image +'" class="img-product  img-responsive img-thumbnail lazy'+((sp[0] != null) ? ' zoom" data-target="#dv-view_image" data-toggle="modal"' : '"')+' data-original="' + ((sp[0] != null) ? 'https://img.remaxthailand.co.th/100x100/product/'+result.sku+'/'+sp[0]+'' : 'https://src.remaxthailand.co.th/img/product/default.jpg') + '" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=100>';
					}
					else {
						html += '<td class="td-thumb padding-left-0"><img data-id="' + result.id + '" class="img-product img-responsive img-thumbnail" data-target="#dv-view_image" src="https://src.remaxthailand.co.th/img/product/default.jpg" width=100>';
					}
					
					html += '<td><span class="text-'+((result.isNew == 1) ? 'red' : 'light-blue')+' font-bold name">' + result.name + '</span>';
					html += (result.isNew == 1) ? ' <img src="/images/icons/new.gif">' : '';
					html += '<br>';
					html += (result.sku != null) ? 'SKU : <b class="sku">' + result.sku + '</b>' : '';
					html += (result.warranty != 0) ? ' &nbsp; ' + $('#msg-warranty').val() + ' : <b>' + ((result.warranty == 365) ? '1 '+$('#msg-year').val() : ((result.warranty >= 30) ? (result.warranty/30)+ ' ' + $('#msg-month').val() : result.warranty + ' ' +$('#msg-day').val())) + '</b>' : '';
					html += '<br>';
					
					if (($('#role').val() == 'dealer' || $('#role').val() == 'member') && result.hasStock == 1) {
						html += '<button class="btn-product-' + result.id + ' btn-add_cart btn btn-sm btn-warning' + ((device == 'desktop') ? ' hidden' : '') + '" data-target="#dv-add_cart" data-toggle="modal">' + $('#msg-orderNow').val() + '</button>';
					}
					
					html += '<span class="no-stock-' + result.id + ' font-sm text-no_stock text-red font-bold' + ((result.hasStock == 1) ? ' hidden' : '') + '"><i class="fa fa-warning"></i> ' + $('#msg-outOfStock').val() + '</span>';

					if ( result.onCart != undefined ) {
						if ( result.onCart > 0 || result.onOrder > 0 ) {
							html += '<br><span class="font-sm text-muted"><span' + ((result.onCart != 0) ? ' class="text-red"' : '') + '>' + $('#msg-itemOnCart').val() + ' : <b>' + result.onCart + '</b></span> / <span' + ((result.onOrder != 0) ? ' class="text-red"' : '') + '>' + $('#msg-onOrder').val() + ' : <b' + ((result.onOrder != 0) ? ' class="font-bigger text-red"' : '') + '>' + result.onOrder + '</b></span></span>';
						}
					}

					html += '</td>';
					if ( result.stock != undefined ) {
						$('#tb-result thead .stock').show();
						html += '<td class="text-right font-bigger text-yellow">' + ((result.stock > 0) ? numberWithCommas(result.stock) : '-' )+ '</td>';
					}

					html += '<td class="text-right font-bigger font-bold text-green">' + numberWithCommas(result.price) + '</td>';

					/*if ( result.wholesalePrice != undefined ) {
						$('#tb-result thead .wholesalePrice').show();
						html += '<td class="text-right font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice) + '</td>';
					}
					if ( result.wholesalePrice1 != undefined ) {
						$('#tb-result thead .wholesalePrice1').show();
						html += '<td class="text-right"><span class="font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice1) + 
							'</span> <i class="fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty1 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i></td>';
					}
					if ( result.wholesalePrice2 != undefined ) {
						$('#tb-result thead .wholesalePrice2').show();
						html += '<td class="text-right"><span class="font-bigger font-bold text-red">' + numberWithCommas(result.wholesalePrice2) + 
							'</span> <i class="fa fa-comment-o show-tooltip" data-toggle="tooltip" title="' + result.qty2 + ' ' + $('#msg-orMoreItems').val() + ' ' + $('#msg-ofThe'+((result.isSameCategory == 1) ? 'Same' : 'Differnce')+'Category').val() + '"></i></td>';
					}*/

					if ( result.price1 != undefined ) {
						$('#tb-result thead .price1').show();
						html += '<td class="text-right font-bigger">' + numberWithCommas(result.price1) + '</td>';
					}
					if ( result.price2 != undefined ) {
						$('#tb-result thead .price2').show();
						html += '<td class="text-right font-bigger">' + numberWithCommas(result.price2) + '</td>';
					}
					/*if ( result.price3 != undefined ) {
						$('#tb-result thead .price3').show();
						html += '<td class="text-right font-bigger' + (($('#role').val() == 'sale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price3) + '</td>';
					}
					if ( result.price4 != undefined ) {
						$('#tb-result thead .price4').show();
						html += '<td class="text-right font-bigger' + (($('#role').val() == 'headSale') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price4) + '</td>';
					}
					if ( result.price5 != undefined ) {
						$('#tb-result thead .price5').show();
						html += '<td class="text-right font-bigger' + (($('#role').val() == 'manager') ? ' text-red font-bold' : '') + '">' + numberWithCommas(result.price5) + '</td>';
					}*/
					html += '</tr>';
				}
			}
		}


	}
	var count;
	if ( config.view == 'box' ) {
		$('.table-responsive').hide();
		$('#dv-box').html(html).show();
		count = $('.dv-cat-'+config.category+'.dv-brand');		
		$('.countItem').html( count.length );		
	}else{
		$('#dv-box').hide();
		$('#tb-result tbody').html(html);
		$('.table-responsive').show();
		count = $('.tr-cat-'+config.category+'.tr-brand');
		$('.countItem').html( count.length );
	}
	$('.countItem').html( count.length );
	
	if (config.showImage){
		$('.td-thumb, .dv-thumb').show();
	}else{
		$('.td-thumb, .dv-thumb').hide();
	}
	
	$('.hidden').removeClass('hidden').hide();
	$('.wait').show();
	$('#dv-loading').hide();
	
	$('img.lazy').lazyload({
		effect : "fadeIn"
	});
}

function searchProduct() {
	var key = $.trim($('#txt-search').val()).toLowerCase();
	if ( key.length > 0 ) {
		var $tr;
		var $div;
		if ( $('#tab .active').hasClass('brand-') ) {
			$tr = $('.tr-cat-'+config.category+'.tr-brand');
			$div = $('.dv-cat-'+config.category+'.dv-brand');
		}
		else {
			$tr = $('.tr-cat-'+config.category+'.tr-brand-'+$('#tab .active').data('id'));
			$div = $('.dv-cat-'+config.category+'.dv-brand-'+$('#tab .active').data('id'));
		}

		$('.tr-show').removeClass('tr-show');
		$tr.each(function(){
			var $obj = $(this);
			if ( $obj.find('.name').html().toLowerCase().indexOf(key) >= 0 || $obj.find('.sku').html().toLowerCase().indexOf(key) >= 0 )
				$obj.addClass('tr-show').show();
			else
				$obj.hide();
		});
		$('.countItem').html( $('.tr-show').length );

		$div.each(function(){
			var $obj = $(this);
			if ( $obj.find('.name').html().toLowerCase().indexOf(key) >= 0 || $obj.find('.sku').html().toLowerCase().indexOf(key) >= 0 )
				$obj.show();
			else
				$obj.hide();
		});

	}
	else {
		if ( $('#tab .active').hasClass('brand-') ) {
			$obj = $('.tr-cat-'+config.category+'.tr-brand');
			$('.tr-cat-'+config.category+'.tr-brand').show();
			$('.dv-cat-'+config.category+'.dv-brand').show();
		}
		else {
			$obj = $('.tr-cat-'+config.category+'.tr-brand-'+$('#tab .active').data('id'))
			$('.tr-cat-'+config.category+'.tr-brand').hide();
			$('.tr-cat-'+config.category+'.tr-brand-'+$('#tab .active').data('id')).show();
			$('.dv-cat-'+config.category+'.dv-brand').hide();
			$('.dv-cat-'+config.category+'.dv-brand-'+$('#tab .active').data('id')).show();
		}
		$('.countItem').html( $obj.length );
	}
}

function showProductImage(pName, sku, pId, imageData){
	var sp = imageData.split(',');
	$('#dv-view_image .carousel-indicators, #dv-view_image .carousel-inner').html('');
	for(i=1, idx=0; i<sp.length; i++) {
			var imgPath = 'https://img.remaxthailand.co.th/500x500/product/'+sku+'/'+sp[i]
			$('#dv-view_image .carousel-indicators').append( '<li data-target="#carousel-product" data-slide-to="'+idx+'" class="'+((idx==0) ? 'active' : '')+'"></li>' );
			$('#dv-view_image .carousel-inner').append('<div class="item'+((idx==0) ? ' active' : '')+'"><img src="'+imgPath+'" alt="..."><div class="carousel-caption"><h3>'+ pName +'</h3></div></div>');
			idx++;
	
		
	}
	if ( $('#dv-view_image .carousel-indicators li').length > 1) {
		$('#dv-view_image .carousel-control, #dv-view_image .carousel-indicators').show();
	}
	else {
		$('#dv-view_image .carousel-control, #dv-view_image .carousel-indicators').hide();
	}
	if ( !$('#carousel-product').hasClass('carousel') ) {
		$('#carousel-product').addClass('carousel').addClass('slide').attr('data-ride', 'carousel');
	}

	if ( typeof $('.btn-product-'+pId).attr('data-target') != 'undefined' ) 
		$('#dv-view_image .modal-footer .input-group').show();
	else
		$('#dv-view_image .modal-footer .input-group').hide();


	$('.carousel').carousel();
}