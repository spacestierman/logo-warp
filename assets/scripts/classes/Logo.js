var Logo = function(source) {
	this.parameters = {
	};
	
	this._source = source;
	
	this._canvas = document.createElement("canvas");
	this._canvas.width = this._source.width;
	this._canvas.height = this._source.height;
	this._context = this._canvas.getContext("2d");
};

Logo.prototype = {
	render: function(totalElapsedMilliseconds) {
		this._context.globalCompositeOperation = "source-over";
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		this._context.fillStyle = "rgba(255, 255, 255, 1.0)";
		this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
		
		this._context.drawImage(this._source, 0, 0);
	},
	
	getDomElement: function() {
		return this._canvas;
	}
};