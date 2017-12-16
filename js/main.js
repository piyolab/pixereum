var pixereum = {};								// store global variables

var SIZE = 100;									// number of columns (rows)
var PIXEL_SIZE = 12;							// pixel width (height)
var CONTRACT_ADDRESS = 
"0x2cbddcdb4f41e6b3aba2bc214279d3238b6d3801"
;
var CONTRACT_ABI = 
[{"constant":false,"inputs":[{"name":"_x","type":"bytes1"},{"name":"_y","type":"bytes1"},{"name":"_message","type":"string"}],"name":"setMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"numberOfPixels","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_x","type":"bytes1"},{"name":"_y","type":"bytes1"},{"name":"_weiAmount","type":"uint256"}],"name":"setPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getColors","outputs":[{"name":"","type":"uint24[10000]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_x","type":"bytes1"},{"name":"_y","type":"bytes1"},{"name":"_red","type":"bytes1"},{"name":"_green","type":"bytes1"},{"name":"_blue","type":"bytes1"}],"name":"setColor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"colors","outputs":[{"name":"","type":"uint24"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_x","type":"bytes1"},{"name":"_y","type":"bytes1"},{"name":"_isSale","type":"bool"}],"name":"setSaleState","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_at","type":"uint16"}],"name":"getPixel","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]
;
var DEFAULT_WEB3_HTTP_PROVIDERS = [
"https://mainnet.infura.io"
];

// Initialize variables
var canvasSize = SIZE * PIXEL_SIZE;				// canvas width (height)
var numPixels = SIZE * SIZE;					// number of pixels

// initialize web 3
var web3 = new Web3(new Web3.providers.HttpProvider(DEFAULT_WEB3_HTTP_PROVIDERS[0]));
pixereum.contract = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

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

function getPixelData(contract, x, y) {
	var pixelData = {};
	var res = contract.getPixel(getPixelNumber(x, y));
	console.log(res);
	if (res) {
		pixelData.hexX = ('00' + x.toString(16).toUpperCase()).substr(-2); 
		pixelData.hexY = ('00' + y.toString(16).toUpperCase()).substr(-2);
		pixelData.owner = res[0];
		pixelData.message = res[1];
		pixelData.ethPrice = res[2]["c"][0]/10000;
		pixelData.isSale = res[3];
	}
	return pixelData;
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

(function($) {
  $.fn.addAutoLink = function() {
  	$(this).html( $(this).html().replace(/((http|https):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1" target="_blank">$1</a>') );
  };
})(jQuery);

// get pixel colors from smart contract
// and render pixels
var res = pixereum.contract.getColors.call();
$.each(pixereum.pixels, function(xIndex, xVal){
	$.each(pixereum.pixels[xIndex], function(yIndex, Val){
		var pixelNumber = getPixelNumber(xIndex, yIndex);
		var intColor = parseInt(res[pixelNumber]["c"]);
		var hexColorString = getHexColorString(intColor);
		fillPixel(context, xIndex, yIndex, hexColorString);
		pixereum.pixels[xIndex][yIndex]= {pixelNumber: pixelNumber, intColor: intColor, color: hexColorString};
	});
});

// add grid
addGrid(canvas, context);

// canvas onclick
canvas.on('click', function(e) {
	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left <= 0 ? 0 : Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
	var y = e.clientY - rect.top <= 0 ? 0 : Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
	console.log("x:", x, "y:", y);
	var pixelNumber = getPixelNumber(x, y);
	e.preventDefault();
    $('#modal_pixel_detail').iziModal({
		title: 'pixel details',
		padding: 20,
		width: 600,
		closeButton: true	
	});
    $('#modal_pixel_detail').iziModal('open');
    $('#modal_pixel_detail').iziModal('startLoading');
    var pixelData = getPixelData(pixereum.contract, x, y);
	$('#modal_pixel_detail_x').text(x);
	$('#modal_pixel_detail_y').text(y);
	$('#modal_pixel_detail_hex_x').text(pixelData.hexX);
	$('#modal_pixel_detail_hex_y').text(pixelData.hexY);
	$('#modal_pixel_detail_pixel_number').text(pixereum.pixels[x][y].pixelNumber)
	$('#modal_pixel_detail_color_hex').text(pixereum.pixels[x][y].color);
	$('#modal_pixel_detail_color_int').text(pixereum.pixels[x][y].intColor);
	$('#modal_pixel_detail_owner').text(pixelData.owner);
	$('#modal_pixel_detail_message').text(pixelData.message);
	$('#modal_pixel_detail_message').addAutoLink();
	if (pixelData.isSale) {
		$('#modal_pixel_detail_sale').text("for sale");	
	} else {
		$('#modal_pixel_detail_sale').text("not for sale");
	}
	$('#modal_pixel_detail_price').text(pixelData.ethPrice);
    $('#modal_pixel_detail').iziModal('stopLoading');
});

canvas.on('mousemove', function(e) {
	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left <= 0 ? 0 : Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
	var y = e.clientY - rect.top <= 0 ? 0 : Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
	console.log("x:", x, "y:", y);
	$('#info_pixel_x').text(x);
	$('#info_pixel_y').text(y);
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


