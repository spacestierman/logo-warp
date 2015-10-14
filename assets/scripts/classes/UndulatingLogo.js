var UndulatingLogo = function(text, width, height, id) {
	this.SLICE_CANVAS_HEIGHT = 1;
	
	this.text = text;
	
	this._canvas = document.createElement('canvas');
	this._canvas.width = width;
	this._canvas.height = height;
	this._canvas.id = id;
	
	this._context = this._canvas.getContext('2d');
	this._context.globalCompositeOperation = 'multiply';
	
	this._sliceCanvas = document.createElement('canvas');
	this._sliceCanvas.width = width;
	this._sliceCanvas.height = this.SLICE_CANVAS_HEIGHT;
	this._sliceContext = this._sliceCanvas.getContext('2d');
	
	this._redCanvas = this._createOffsetCanvas(this.text, width, height, "red");
	this._greenCanvas = this._createOffsetCanvas(this.text, width, height, "green");
	this._blueCanvas = this._createOffsetCanvas(this.text, width, height, "blue");
};

UndulatingLogo.prototype = {
	update: function(elapsedMilliseconds) {
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		
		var shrinkageFactor = 2;
		for (var y = -32; y < this._canvas.height / shrinkageFactor; y += 1) {
			var angle = -Math.sin((elapsedMilliseconds / 100 + y) / 10) / 10;
			var offset = Math.cos(elapsedMilliseconds / 10) / 5;
			var displaceStrength = angle * DISPLACEMENT_MULTIPLIER;
			
			var drawAtY = y + 16;
			this._drawToSliceCanvas(angle, this._redCanvas, y * shrinkageFactor);
			this._context.drawImage(this._sliceCanvas, offset + displaceStrength, drawAtY);
			
			var GREEN_EFFECT = 1;  // Makes a little more green appear when animating
			this._drawToSliceCanvas(angle, this._greenCanvas, y * shrinkageFactor + GREEN_EFFECT);
			this._context.drawImage(this._sliceCanvas, 0, drawAtY);
			
			this._drawToSliceCanvas(angle, this._blueCanvas, y * shrinkageFactor);
			this._context.drawImage(this._sliceCanvas, offset - displaceStrength, drawAtY);
		}
	},
	
	getCanvas: function() {
		return this._canvas;	
	},
	
	getRedCanvas: function() {
		return this._redCanvas;
	},
	
	
	getGreenCanvas: function() {
		return this._greenCanvas;
	},
	
	getBlueCanvas: function() {
		return this._blueCanvas;
	},
	
	getSliceCanvas: function() {
		return this._sliceCanvas;
	},
	
	_createOffsetCanvas: function (text, w, h, fillStyle) {
	  var canvas = document.createElement('canvas');
	  canvas.width = w;
	  canvas.height = h;
	  var context =canvas.getContext('2d');
	  context.font = '80px sans-serif';
	  context.fillStyle = fillStyle;
	  
	  var measuredText = context.measureText(text); 
	  var textWidth = measuredText.width;
	  var textHeight = 69; // No measuredText.height?  WTF canvas API.
	  
	  var textX = w / 2 - textWidth / 2;
	  var textY = h / 2 - textHeight / 2;
	  context.fillText(text, textX, textY * 2);
	  
	  return canvas;
	},
	
	_drawToSliceCanvas: function (angle, canvas, y) {
	  this._sliceContext.save();
	  this._sliceContext.clearRect(0, 0, this._sliceCanvas.width, this._sliceCanvas.height);
	  this._sliceContext.translate(-this._sliceCanvas.width/2, -y/2);
	  this._sliceContext.rotate(angle);
	  this._sliceContext.translate(this._sliceCanvas.width/2, y/2);
	  this._sliceContext.drawImage(canvas, 0, -y);
	  this._sliceContext.restore();
	}
	
};
