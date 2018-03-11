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

canvas.hide();

canvas.css({'width':canvasSize/2, 'height':canvasSize/2, 'background-color':'#000000'});

// add canvas
$('body').append(canvas);
var context = canvas[0].getContext('2d');

function getPixelNumber(x, y) {
	return x + y * SIZE;
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

function canvasImageUrl() {
	var canvas = $("#canvas")[0];
	return canvas.toDataURL();
}

function setupIframe() {
	document.body.style.margin = "0px";
	document.body.style.padding = "0px";

	var iframe = document.createElement('iframe');
	var ins = document.getElementById('__pixereum__');
	ins.appendChild(iframe);
	iframe.style.margin = "0px";
	iframe.style.padding = "0px";
	iframe.style.border = "none";
	iframe.style.width = ins.style.width;
	iframe.style.height = ins.style.width;
	iframe.style.backgroundColor = "#000000";
	
	var doc = iframe.contentWindow.document;
	doc.open();
	var img_url = canvasImageUrl();
	doc.write('<style>body{margin:0px}</style>');
	doc.write('<a href="http://pixereum.io" target="_blank">'
		+ '<img src="' + img_url + '" width="100%" height="100%" style="padding:0px; margin:0px" />'
		+ '</a>');
	doc.close();
}

function initApp() {
	initSettings();
	initWeb3();
	initContract();

	getPixels(()=>{
		addGrid(canvas, context);
		setupIframe();
	});
}

window.addEventListener('load', function() {
	initApp();
});