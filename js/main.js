var isMainnet = false;

var pixereum = {};								// store global variables

var SIZE = 100;									// number of columns (rows)
var PIXEL_SIZE = 12;							// pixel width (height)

var CONTRACT_ADDRESS = [
"0xBFC28Cd8b0F3AdBF0686DBF97dE4212eFf5A42b9",	// Ropsten
"0xc0d72D45CcA854e0F2fE3Cd2D4BAb91E772fE4C0"	// Mainnet
];

var CONTRACT_ABI = 
[{"constant":true,"inputs":[],"name":"feeRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"width","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"colors","outputs":[{"name":"","type":"uint24"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getColors","outputs":[{"name":"","type":"uint24[10000]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_pixelNumber","type":"uint16"}],"name":"getPixel","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isMessageEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numberOfPixels","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_color","type":"uint24"}],"name":"setColor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"address"},{"name":"_pixelNumber","type":"uint16"},{"name":"_color","type":"uint24"},{"name":"_message","type":"string"}],"name":"buyPixel","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_isSale","type":"bool"}],"name":"setSaleState","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"}],"name":"deleteMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_weiAmount","type":"uint256"}],"name":"setPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_isMesssageEnabled","type":"bool"}],"name":"setMessageStatus","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint16"},{"name":"_message","type":"string"}],"name":"setMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"}]
;

var DEFAULT_WEB3_HTTP_PROVIDERS = [
"https://ropsten.infura.io",		// Ropsten
"https://mainnet.infura.io"			// Mainnet
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
	console.log(colorInt);
	return colorInt;
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
	context.lineWidth = 0.3;
	for(i = 0; i < SIZE+1; i++) {
		step = (i * PIXEL_SIZE);		
		context.moveTo(step, 0);
		context.lineTo(step, canvasSize);
		context.moveTo(0, step);
		context.lineTo(canvasSize, step);
	}
	context.stroke();
}

function getMousePosition(e) {
	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left <= 0 ? 0 : Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
	var y = e.clientY - rect.top <= 0 ? 0 : Math.floor((e.clientY - (rect.top+0.01)) / PIXEL_SIZE);
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
  if (typeof web3 !== 'undefined') {
    console.log('Using MetaMask!')
    window.web3 = new Web3(web3.currentProvider);
    pixereum.isMetaMask = true;
  } else {
    console.log('Using HTTP provider!')
    window.web3 = new Web3(new Web3.providers.HttpProvider(pixereum.httpProvider));
  }
}


function initContract() {
	var address = CONTRACT_ADDRESS[1];
	if (!isMainnet) address = CONTRACT_ADDRESS[0];
	pixereum.contract = window.web3.eth.contract(CONTRACT_ABI).at(pixereum.address);
}


function getPixels(callback) {
	pixereum.contract.getColors(function(error, result){
		if(!error) {
        	console.log(result);
        	$.each(pixereum.pixels, function(xIndex, xVal){
				$.each(pixereum.pixels[xIndex], function(yIndex, Val){
					var pixelNumber = getPixelNumber(xIndex, yIndex);
					var intColor = parseInt(result[pixelNumber]["c"]);
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


function registerPixelBuyButton() {

	$('#pixel_buy_button_metamask').click(function(e) {
		console.log("buy width MetaMask!");
		var x = $('#pixel_x').val();
		var y = $('#pixel_y').val();
		var pixelNumber = getPixelNumber(parseInt(x, 10), parseInt(y, 10));
		var owner = $('#pixel_buy_owner').val();
		var color = $('#pixel_buy_color').val();
		var intColor = getIntColor(color);
		var message = $('#pixel_buy_message').val();
		var price = $('#pixel_price').val();
		var weiValue = web3.toWei(price, "ether");

		console.log("owner", owner);
		console.log("pixelNumber", pixelNumber);
		console.log("color", color);
		console.log("intColor", intColor);
		console.log("message", message);
		console.log("price", price);

		pixereum.contract.buyPixel(owner, pixelNumber, intColor, message,
								   {value:weiValue},
		function(error, result) {
			console.log(result);
		});

	});	
}


function resetField() {
	$('#pixel_buy_message').val("");
	$('#pixel_color_picker').val("");
	$('#pixel_buy_color').val("");
}


function getPixelData(x, y, callback) {
	pixereum.contract.getPixel(getPixelNumber(x, y), function(error, result){
		if(!error) {
        	console.log(result);
        	var pixelData = {};
			pixelData.hexX = ('00' + x.toString(16).toUpperCase()).substr(-2); 
			pixelData.hexY = ('00' + y.toString(16).toUpperCase()).substr(-2);
			pixelData.owner = result[0];
			pixelData.message = result[1];
			pixelData.ethPrice = result[2]["c"][0]/10000;
			pixelData.isSale = result[3];
        	callback(pixelData);
    	} else {
        	console.error(error);
    	}
	});
}


function registerCanvasClick() {
	canvas.on('click', function(e) {

		resetField();

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

		if (pixereum.isMetaMask) {
			$('#pixel_buy_owner').val(window.web3.eth.accounts[0]);			
		}

		getPixelData(x, y, (pixelData) => {
			$('#pixel_detail_x_hex').text(pixelData.hexX);
			$('#pixel_detail_y_hex').text(pixelData.hexY);
			$('#pixel_detail_number').text(pixereum.pixels[x][y].pixelNumber)
			$('#pixel_detail_color_hex').text(pixereum.pixels[x][y].color);
			$('#pixel_detail_color_int').text(pixereum.pixels[x][y].intColor);
			$('#pixel_detail_owner').text(pixelData.owner);
			$('#pixel_detail_message').text(pixelData.message);
			$('#pixel_detail_message').addAutoLink();
			if (pixelData.isSale) {
				$('#pixel_detail_sale_status').text("for sale");
			} else {
				$('#pixel_detail_sale_status').text("not for sale");
			}
			$('#pixel_detail_price').text(pixelData.ethPrice);
			$('#pixel_price').val(pixelData.ethPrice);
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
	});
}


function registerColorPicker() {
	$('#pixel_color_picker').on("change", function(){
		var colorHex = $('#pixel_color_picker').val();
		$('#pixel_buy_color').val(colorHex);
	});
}


function initApp() {
	initSettings();
	initWeb3();
	initContract();

	getPixels(()=>{
		addGrid(canvas, context);
		registerModals();
		registerCanvasClick();
		registerMouseMove();
		registerPixelBuyButton();
		registerColorPicker();
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
			width: 1000,
			closeButton: true	
		});
	    $('#modal_about').iziModal('open');
	});
}

window.addEventListener('load', function() {
	initApp();
});