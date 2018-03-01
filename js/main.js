var pixereum = {};								// store global variables

var SIZE = 256;									// number of columns (rows)
var PIXEL_SIZE = 5;								// pixel width (height)
var CONTRACT_ADDRESS = 
"0xe97356bde55b3f6c20221893d7873806d6dc821e"	// Ropsten
;
var CONTRACT_ABI = 
[{"constant":true,"inputs":[],"name":"width","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"colors","outputs":[{"name":"","type":"uint24"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"feeRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getColors","outputs":[{"name":"","type":"uint24[65536]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_pixelNumber","type":"uint24"}],"name":"getPixel","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isMessageEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numberOfPixels","outputs":[{"name":"","type":"uint24"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"address"},{"name":"_pixelNumber","type":"uint24"},{"name":"_color","type":"uint24"},{"name":"_message","type":"string"}],"name":"buyPixel","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint24"},{"name":"_isSale","type":"bool"}],"name":"setSaleState","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint24"}],"name":"deleteMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint24"},{"name":"_weiAmount","type":"uint256"}],"name":"setPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint24"},{"name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_isMesssageEnabled","type":"bool"}],"name":"setMessageStatus","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint24"},{"name":"_message","type":"string"}],"name":"setMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":false,"inputs":[{"name":"_pixelNumber","type":"uint24"},{"name":"_color","type":"uint24"}],"name":"setColor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
;
var DEFAULT_WEB3_HTTP_PROVIDERS = [
"https://ropsten.infura.io"
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

function initApp() {
	// get pixel colors from smart contract
	// and render pixels
	// var res = pixereum.contract.getColors.call();

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
			addGrid(canvas, context);
    	} else {
        	console.error(error);
    	}
	});

	// add grid

	// canvas onclick
	canvas.on('click', function(e) {
		var p = getMousePosition(e);
		var x = p.x;
		var y = p.y;
		// console.log("x:", x, "y:", y);
		var pixelNumber = getPixelNumber(x, y);
		console.log(pixelNumber);
		e.preventDefault();
	    $('#modal_pixel_detail').iziModal({
			title: 'pixel details',
			padding: 20,
			width: 600,
			closeButton: true	
		});
	    $('#modal_pixel_detail').iziModal('open');
	    $('#modal_pixel_detail').iziModal('startLoading');
		$('#modal_pixel_detail_x').text(x);
		$('#modal_pixel_detail_y').text(y);

		var pixelData = {};
		pixereum.contract.getPixel(getPixelNumber(x, y), function(error, result){
			if(!error) {
	        	console.log(result);
				pixelData.hexX = ('00' + x.toString(16).toUpperCase()).substr(-2); 
				pixelData.hexY = ('00' + y.toString(16).toUpperCase()).substr(-2);
				pixelData.owner = result[0];
				pixelData.message = result[1];
				pixelData.ethPrice = result[2]["c"][0]/10000;
				pixelData.isSale = result[3];
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

					if(pixereum.isMetaMask) {
						$('#modal_pixel_buy').click(function(e) {
							console.log("buy");
							data = "0x" + pixelData.hexX + pixelData.hexY + "FFFFFF";
							console.log("CONTRACT_ADDRESS: " + CONTRACT_ADDRESS);
							console.log("data: " + data);
							web3.eth.sendTransaction({to: CONTRACT_ADDRESS, data: data, value: web3.toWei(pixelData.ethPrice, "ether"), gasLimit: 200000}, function(error, transactionHash) {
		  						if (!error) {
		  							console.log(transactionHash);
		  						}
							});
						});	
					}
				} else {
					$('#modal_pixel_detail_sale').text("not for sale");
					$('#modal_pixel_buy').hide();
				}
				$('#modal_pixel_detail_price').text(pixelData.ethPrice);
			    $('#modal_pixel_detail').iziModal('stopLoading');
	    	} else {
	        	console.error(error);
	    	}
		});
	});

	canvas.on('mousemove', function(e) {
		var p = getMousePosition(e);
		// console.log("x:", p.x, "y:", p.y);
		$('#info_pixel_x').text(p.x);
		$('#info_pixel_y').text(p.y);
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
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    console.log('Using MetaMask!')
    window.web3 = new Web3(web3.currentProvider);
    pixereum.isMetaMask = true;
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    // window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    window.web3 = new Web3(new Web3.providers.HttpProvider(DEFAULT_WEB3_HTTP_PROVIDERS[0]));
  }

  // Now you can start your app & access web3 freely:
  pixereum.contract = window.web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
  initApp();
})
