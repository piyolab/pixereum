var isMainnet = true;

var pixereum = {};								// store global variables

var SIZE = 100;									// number of columns (rows)
var PIXEL_SIZE = 10 * 2;							// pixel width (height)

var width = $(window).width()
if(width < 800) {
	PIXEL_SIZE = width/100 * 2;
}

var CONTRACT_ADDRESS = [
"0xBFC28Cd8b0F3AdBF0686DBF97dE4212eFf5A42b9",	// Ropsten
"0xc0d72D45CcA854e0F2fE3Cd2D4BAb91E772fE4C0"	// Mainnet
];

var CONTRACT_ABI = 
[{"constant":true,"inputs":[],"name":"feeRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"width","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"colors","outputs":[{"name":"","type":"uint24"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getColors","outputs":[{"name":"","type":"uint24[10000]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_pixelNumber","type":"uint16"}],"name":"getPixel","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isMessageEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numberOfPixels","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_color","type":"uint24"}],"name":"setColor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"address"},{"name":"_pixelNumber","type":"uint16"},{"name":"_color","type":"uint24"},{"name":"_message","type":"string"}],"name":"buyPixel","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_isSale","type":"bool"}],"name":"setSaleState","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"}],"name":"deleteMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_weiAmount","type":"uint256"}],"name":"setPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_isMesssageEnabled","type":"bool"}],"name":"setMessageStatus","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_message","type":"string"}],"name":"setMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"}]
;

var DEFAULT_WEB3_HTTP_PROVIDERS = [
"https://ropsten.infura.io/v3/ab6d6b83d2084a7da09f78da2c958770",	// Ropsten
"https://mainnet.infura.io/v3/ab6d6b83d2084a7da09f78da2c958770"		// Mainnet
];

// Initialize variables
var canvasSize = SIZE * PIXEL_SIZE;				// canvas width (height)
var numPixels = SIZE * SIZE;					// number of pixels

// Initialize pixels
pixereum.pixels = Array(SIZE);
$.each(pixereum.pixels, function(index, val){
	pixereum.pixels[index] = Array(SIZE);
});

// create canvas
var canvas = $('<canvas>').attr({
  width: canvasSize,
  height: canvasSize,
  id: "canvas"
})

canvas.css({'width':canvasSize/2, 'height':canvasSize/2, 'background-color':'#000000'});

// add canvas
$('#main_box').append(canvas);
var context = canvas[0].getContext('2d');

function getPixelNumber(x, y) {
	return x + y * SIZE;
}

function getIntColor(colorCode) {
	colorCode = colorCode.slice(1);
	r = parseInt(colorCode.substr(0,2), 16);
	g = parseInt(colorCode.substr(2,2), 16);
	b = parseInt(colorCode.substr(4,2), 16);
	colorInt = r*256*256 + g*256 + b;
	// console.log(colorInt);
	return colorInt;
}

function getHexCoordString(coord) {
	return ('00' + coord.toString(16).toUpperCase()).substr(-2);
}

function getHexColorString(val) {
    return (('000000' + val.toString(16).toUpperCase()).substr(-6));
}

function fillPixel(context, x, y, color) {
	context.fillStyle = '#' + color;
	context.fillRect(x*PIXEL_SIZE, y*PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

function addGrid(canvas, context){
	context.beginPath();		
	context.strokeStyle = "#FFFFFF";
	context.lineWidth = 0.4;
	context.lineWidth = 0.3;
	for(i = 0; i < SIZE+1; i++) {
		step = (i * PIXEL_SIZE);
		if (width < 800) step = step + 0.2
		context.moveTo(step, 0);
		context.lineTo(step, canvasSize);
		context.moveTo(0, step);
		context.lineTo(canvasSize, step);
	}
	context.stroke();
}

function getMousePosition(e) {
	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left <= 0 ? 0 : Math.floor((e.clientX - rect.left) / PIXEL_SIZE * 2);
	var y = e.clientY - rect.top <= 0 ? 0 : Math.floor((e.clientY - (rect.top+0.01)) / PIXEL_SIZE * 2);
	return {x:x, y:y};
}

(function($) {
  $.fn.addAutoLink = function() {
  	$(this).html( $(this).html().replace(/((http|https):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1" target="_blank">$1</a>') );
  };
})(jQuery);

function initSettings() {
	if (isMainnet) {
		// settings for Mainnet
		pixereum.httpProvider = DEFAULT_WEB3_HTTP_PROVIDERS[1];
		pixereum.address = CONTRACT_ADDRESS[1];
	} else {
		// settings for Ropsten
		pixereum.httpProvider = DEFAULT_WEB3_HTTP_PROVIDERS[0];
		pixereum.address = CONTRACT_ADDRESS[0];
	}
}


function initWeb3(){
  if (window.ethereum) {
    console.log('Using Browser provider!');
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    pixereum.isMetaMask = true;
  } else {
    console.log('Using HTTP provider!')
    window.web3 = new Web3(new Web3.providers.HttpProvider(pixereum.httpProvider));
  }
}


function initContract() {
	var address = CONTRACT_ADDRESS[1];
	if (!isMainnet) address = CONTRACT_ADDRESS[0];
	pixereum.contract = new window.web3.eth.Contract(CONTRACT_ABI, pixereum.address);
}


function getPixels(callback) {
	pixereum.contract.methods.getColors().call(function(error, result){
		if(!error) {
        	console.log(result);
        	$.each(pixereum.pixels, function(xIndex, xVal){
				$.each(pixereum.pixels[xIndex], function(yIndex, Val){
					var pixelNumber = getPixelNumber(xIndex, yIndex);
					var intColor = parseInt(result[pixelNumber]);
					var hexColorString = getHexColorString(intColor);
					fillPixel(context, xIndex, yIndex, hexColorString);
					pixereum.pixels[xIndex][yIndex]= {pixelNumber: pixelNumber, intColor: intColor, color: hexColorString};
				});
			});		
			callback();
    	} else {
        	console.error(error);
    	}
	});
}

function registerModals() {
    $('#modal_pixel_detail').iziModal({
		title: 'pixel details',
		group: "detail",
		padding: 20,
		width: 600,
		fullscreen: true,
		closeButton: true	
	});
}


function getPixelBuyInputs() {
	return {
		x: parseInt($('#pixel_x').val()),
		y: parseInt($('#pixel_y').val()),
		owner: $('#pixel_buy_owner').val(),
		color: $('#pixel_buy_color').val(),
		message: $('#pixel_buy_message').val(),
		price: $('#pixel_price').val(),
	}
}


function checkSaleStatus() {
	var isSale = $('#pixel_sale_status').val();
	if(isSale != "true") {
		return false;
	} else {
		return true;
	}
}


function showTransactionResult(result) {
	$('#tx_result').empty();
	var baseUrl = "https://etherscan.io/tx/";
	if (!isMainnet) baseUrl = "https://ropsten.etherscan.io/tx/";
	var url = baseUrl + result;
	$('#tx_result').append($( "<a>", {
		href: url,
		text: "etherscan: " + result,
		target: "_blank"
	}));
	$('#transaction_result').show();
}


function registerPixelBuyButton() {

	$('#pixel_buy_button_metamask').click(function(e) {
		console.log("buy width MetaMask!");
		$('#transaction_result').hide();

		if (!checkSaleStatus()) {
			alert("This pixel is currently not for sale.");
			return;
		}

		var inputs = getPixelBuyInputs();
		console.log(inputs);
		var intColor = getIntColor(inputs.color);
		var pixelNumber = getPixelNumber(inputs.x, inputs.y);
		var weiValue = web3.toWei(inputs.price, "ether");

		pixereum.contract.buyPixel(inputs.owner,
									pixelNumber,
									intColor,
									inputs.message,
								   {value:weiValue},
								   function(error, result) {
			console.log(result);
			if (result) {
				showTransactionResult(result);
			}
		});

	});	
}


function registerDirectPixelBuyButton() {
	$('#pixel_buy_button_direct').click(function(e) {
		console.log("buy directly!");

		if (!checkSaleStatus()) {
			alert("This pixel is currently not for sale.");
			return;
		}

		var inputs = getPixelBuyInputs();
		console.log(inputs);
		var hexX = getHexCoordString(inputs.x);
		var hexY = getHexCoordString(inputs.y);
		var colorCode = inputs.color.slice(1);

		var data = "0x" + hexX + hexY + colorCode;

		$('#pixel_direct_address').val(pixereum.address);		
		$('#pixel_direct_price').val(inputs.price);
		$('#pixel_direct_data').val(data);

		$('#get_pixel_direct').show();

	});
}


function registerUpdateButtons() {
	
	$('#update_owner').click(function(e) {
		var pixelNumber = $('#pixel_number').val();
		var address = $('#update_owner_input').val();
		pixereum.contract.setOwner(pixelNumber, address, (err, res) => {
			if (res) showTransactionResult(res);
		});
	});

	$('#update_color').click(function(e) {
		var pixelNumber = $('#pixel_number').val();
		var colorCode = $('#update_color_input').val();
		var intColor = getIntColor(colorCode);
		pixereum.contract.setColor(pixelNumber, intColor, (err, res) => {
			if (res) showTransactionResult(res);
		});
	});

	$('#update_message').click(function(e) {
		var pixelNumber = $('#pixel_number').val();
		var message = $('#update_message_input').val();
		pixereum.contract.setMessage(pixelNumber, message, (err, res) => {
			if (res) showTransactionResult(res);
		});
	});

	$('#update_price').click(function(e) {
		var pixelNumber = $('#pixel_number').val();
		var price = $('#update_price_input').val();
		if (price <= 0) {
			alert("Error. Price should be more than 0");
			return;
		}
		var weiValue = web3.toWei(price, "ether");
		pixereum.contract.setPrice(pixelNumber, weiValue, (err, res) => {
			if (res) showTransactionResult(res);
		});
	});

	$('#update_sale').click(function(e) {
		var pixelNumber = $('#pixel_number').val();
		var isSale = $('input[name=isSale]:eq(0)').prop('checked');
		pixereum.contract.setSaleState(pixelNumber, isSale,	(err, res) => {
			if (res) showTransactionResult(res);
		});
	});
}


function refreshUpdatePixelSection(pixelData) {
	if(pixereum.isMetaMask != true) return;
	if(pixelData.owner != window.web3.eth.accounts[0]) return;
	console.log("pixelData", pixelData);
	$('#get_pixel').hide();
	$('#update_color_input').val('#'+pixelData.color);
	$('#update_color_picker').val('#'+pixelData.color);
	$('#update_message_input').val(pixelData.message);
	$('#update_price_input').val(pixelData.ethPrice);
	if (pixelData.isSale) {
		$('input[name=isSale]:eq(0)').prop('checked', true);
	} else {
		$('input[name=isSale]:eq(1)').prop('checked', true);
	}
	$('#update_pixel_section').show();
}


function resetField(message, color) {
	$('#pixel_buy_message').val(message);
	$('#pixel_color_picker').val("#" + color);
	$('#pixel_buy_color').val("#" + color);
}


function hideSections() {
	$('#get_pixel').hide();
	$('#get_pixel_direct').hide();
	$('#transaction_result').hide();
	$('#update_pixel_section').hide();
}

function hideDetails() {
	if(pixereum.isMetaMask == true) {
		$('#pixel_buy_button_direct').hide();
	} else {
		$(".metamask").map(function(){
    		return $(this).hide();
		});
	}
}


function getPixelData(x, y, callback) {
	pixereum.contract.methods.getPixel(getPixelNumber(x, y)).call(function(error, result){
		if(!error) {
        	console.log(result);
        	var pixelData = {};
			pixelData.x = x;
			pixelData.y = y;
			pixelData.hexX = getHexCoordString(x); 
			pixelData.hexY = getHexCoordString(y);
			pixelData.pixelNumber = pixereum.pixels[x][y].pixelNumber;
			pixelData.color = pixereum.pixels[x][y].color;
			pixelData.intColor = pixereum.pixels[x][y].intColor;
			pixelData.owner = result[0];
			pixelData.message = result[1];
			pixelData.ethPrice = web3.utils.fromWei(result[2]);
			pixelData.isSale = result[3];
        	callback(pixelData);
    	} else {
        	console.error(error);
    	}
	});
}





function registerCanvasClick() {
	canvas.on('click', function(e) {

		hideSections();

		var p = getMousePosition(e);
		var x = p.x;
		var y = p.y;
		console.log("x:", x, "y:", y);
		var pixelNumber = getPixelNumber(x, y);
		console.log(pixelNumber);
		e.preventDefault();

	    $('#modal_pixel_detail').iziModal('open');
	    $('#modal_pixel_detail').iziModal('startLoading');
		$('#pixel_detail_x').text(x);
		$('#pixel_detail_y').text(y);
		$('#pixel_x').val(x);
		$('#pixel_y').val(y);
		$('#pixel_number').val(pixelNumber);

		if (pixereum.isMetaMask) {
			$('#pixel_buy_owner').val(window.web3.eth.accounts[0]);			
		}

		getPixelData(x, y, (pixelData) => {
			$('#pixel_detail_x_hex').text(pixelData.hexX);
			$('#pixel_detail_y_hex').text(pixelData.hexY);
			$('#pixel_detail_number').text(pixelData.pixelNumber)
			$('#pixel_detail_color_hex').text(pixelData.color);
			$('#pixel_detail_color_int').text(pixelData.intColor);
			$('#pixel_detail_owner').text(pixelData.owner);
			$('#pixel_detail_message').text(pixelData.message);
			$('#pixel_detail_message').addAutoLink();
			resetField(pixelData.message, pixelData.color);
			$('#pixel_sale_status').val(pixelData.isSale);
			if (pixelData.isSale) {
				$('#pixel_detail_sale_status').text("for sale");
			} else {
				$('#pixel_detail_sale_status').text("not for sale");
			}
			$('#pixel_detail_price').text(pixelData.ethPrice);
			$('#pixel_price').val(pixelData.ethPrice);
			$('#get_pixel').show();
			refreshUpdatePixelSection(pixelData);
		    $('#modal_pixel_detail').iziModal('stopLoading');
		});

	});
}


function registerMouseMove() {
	canvas.on('mousemove', function(e) {
		var p = getMousePosition(e);
		// console.log("x:", p.x, "y:", p.y);
		$('#info_pixel_x').text(p.x);
		$('#info_pixel_y').text(p.y);
		$('#info_pixel_number').text(getPixelNumber(p.x, p.y));
	});
}


function registerColorPicker() {
	$('#pixel_color_picker').on("change", function(){
		var colorHex = $('#pixel_color_picker').val();
		$('#pixel_buy_color').val(colorHex);
	});
	$('#pixel_buy_color').on("change", function(){
		var colorHex = $('#pixel_buy_color').val();
		$('#pixel_color_picker').val(colorHex);
	});
}

function registerUpdateColorPicker() {
	$('#update_color_picker').on("change", function(){
		var colorHex = $('#update_color_picker').val();
		$('#update_color_input').val(colorHex);
	});
	$('#update_color_input').on("change", function(){
		var colorHex = $('#update_color_input').val();
		$('#update_color_picker').val(colorHex);
	});
}



function getUrlParam(key) {
    key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function initApp() {
	var network = getUrlParam('network')
	if (network == '2') {
		isMainnet = false
	}

	initSettings();
	initWeb3();
	initContract();

	getPixels(()=>{
		addGrid(canvas, context);
		registerModals();
		registerCanvasClick();
		registerMouseMove();
		registerPixelBuyButton();
		registerDirectPixelBuyButton();
		registerColorPicker();
		registerUpdateColorPicker();
		hideDetails();
		registerUpdateButtons();
	});

	// info_panel
	$('#info_pixel_num').text(numPixels);
	$('#info_pixel_x').text(0);
	$('#info_pixel_y').text(0);

	// show about
	$(document).on('click', '.about_trigger', function (event) {
	    event.preventDefault();
	    $('#modal_about').iziModal({
			title: 'about this project',
			padding: 100,
			width: 800,
			closeButton: true	
		});
	    $('#modal_about').iziModal('open');
	});
}

window.addEventListener('load', function() {
	initApp();
});