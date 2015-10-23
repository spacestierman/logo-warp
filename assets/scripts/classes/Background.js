/*
	Other possibilities:
	http://pixelshaders.com/editor/
	http://www.airtightinteractive.com/demos/js/shaders/mirror/
	http://www.routter.co.tt/

*/

var Background = function(width, height, tile, messages) {
	this.parameters = {
		fontSizeInPixels: 20,
		stepHeightInPixels: 30
	};
	
	this._canvas = document.createElement("canvas");
	this._canvas.width = width;
	this._canvas.height = height;
	this._context = this._canvas.getContext("2d");
	this._context.globalCompositeOperation = "multiply";
	
	this._tile = tile;
	this._messages = messages;
}

Background.prototype = {
	render: function(totalElapsedMilliseconds) {
		this._context.globalCompositeOperation = "screen";
		this._context.fillStyle = "rgba(255, 255, 255, 1)";
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		
		//this._renderBackgroundTile(totalElapsedMilliseconds);
		
		//this._context.fillRect(0, 0, this._canvas.width, this._canvas.height / 2);
		
		this._context.font = this.parameters.fontSizeInPixels + " serif";
		this._context.fillStyle = "rgba(0, 0, 0, 100)";
		
		var messageIndex = 0;
		var current = { 
			x: 0,
			y: 0	
		};
		
		this._context.globalCompositeOperation = "multiply";
		while(current.y <= this._canvas.height)
		{
			var percentageHeight = current.y / this._canvas.height;
			
			current.x = Math.sin(totalElapsedMilliseconds / 1000 + percentageHeight * Math.PI * 2) * 100;
			while(current.x <= this._canvas.width)
			{
				var message = this._messages[messageIndex];
				var metrics = this._context.measureText(message);
				
				this._context.fillStyle = this._getRandomColor(128);
				this._context.fillText(message, current.x, current.y);
				
				current.x += metrics.width;
				messageIndex++;
				
				if (messageIndex >= this._messages.length) {
					messageIndex = 0;
				}
			}
			
			current.y += this.parameters.stepHeightInPixels;
		}	
	},
	
	getDomElement: function() {
		return this._canvas;
	},
	
	_renderBackgroundTile: function(totalElapsedMilliseconds) {
		for(var x=0; x < this._canvas.width; x += this._tile.width)
		{
			for(var y=0; y <this._canvas.height; y += this._tile.height)
			{
				this._context.drawImage(this._tile, x, y);
			}
		}
	},
	
	_getRandomColor: function(alpha) {
		var color = "rgba(" + this._getRandom255() + ", " + this._getRandom255() + ", " + this._getRandom255() + ", " + alpha + ")";
		return color;
	},
	
	_getRandom255: function() {
		return Math.floor(Math.random() * 255);
	}
};