var Scroller = function(width, height, canvas, logo) {
	this.DEFAULT_WIPE_ALPHA = 0.25;
	
	this.params = {
		scrollSpeed: 1,
		wipeAlpha: this.DEFAULT_WIPE_ALPHA,
		scanAngle: 0.0,
		scanHeight: 20.0,
		debug: false,
		showLogo: true,
		brushAngle: 0.0,
		brushX: 0.0,
		brushY: 0.0,
		brushScaleX: 1.0,
		brushScaleY: 1.0
	};
	
	this._backgroundCanvas = document.createElement('canvas');
	this._backgroundCanvas.width = width;
	this._backgroundCanvas.height = height;
	this._backgroundCanvas.id = "background";
	this._backgroundContext = this._backgroundCanvas.getContext('2d');
	this._backgroundContext.globalCompositeOperation = "multiply";
	
	this._foregroundCanvas = document.createElement('canvas');
	this._foregroundCanvas.width = this._backgroundCanvas.width;
	this._foregroundCanvas.height = this._backgroundCanvas.height;
	this._foregroundCanvas.id = "foreground";
	this._foregroundContext = this._foregroundCanvas.getContext('2d');
	
	this._compositeCanvas = document.createElement('canvas');
	this._compositeCanvas.width = this._backgroundCanvas.width;
	this._compositeCanvas.height = this._backgroundCanvas.height;
	this._compositeCanvas.id = "composite";
	this._compositeContext = this._compositeCanvas.getContext('2d');
	
	this._temporaryCanvas = document.createElement('canvas');
	this._temporaryCanvas.width = this._backgroundCanvas.width;
	this._temporaryCanvas.height = this._backgroundCanvas.height;
	this._temporaryCanvas.id = "temporary";
	this._temporaryContext = this._temporaryCanvas.getContext('2d');
	
	this._undulatingCanvas = canvas;
	this._logo = logo;
	
	this._mainPosition = { x: 175, y: 800 };
	
	this._startedAt = new Date().getTime();
	this._lastRenderTicks = new Date().getTime();
	this._t = 0;
	
	// $(this._compositeCanvas).on('mousemove', function(event) {
	//   this._mousePosition.x = event.pageX;
	//   this._mousePosition.y = event.pageY;
	// }.bind(this));
	// $(this._compositeCanvas).on('mousedown', function(event) {
	//   this._mouseIsDown = true;
	// }.bind(this));
	// $(this._compositeCanvas).on('mouseup', function(event) {
	//   this._mouseIsDown = false;
	// }.bind(this));
};

Scroller.prototype = {
	getCanvas: function() {
		return this._compositeCanvas;
	},
	
	render: function() {
		var nowTicks = new Date().getTime();
		var totalElapsedMilliseconds = this._startedAt - this._lastRenderTicks;
		
		  
		this._foregroundContext.clearRect(0, 0, this._foregroundCanvas.width, this._foregroundCanvas.height);
		this._foregroundContext.save();
		this._foregroundContext.globalCompositeOperation = "source-over";
		this._foregroundContext.translate(this.params.brushX + this._undulatingCanvas.width /2, this.params.brushY + this._undulatingCanvas.height / 2);
		this._foregroundContext.rotate(this.params.brushAngle);
		this._foregroundContext.translate(-this.params.brushX - this._undulatingCanvas.width / 2, -this.params.brushY - this._undulatingCanvas.height / 2);
		this._foregroundContext.scale(this.params.brushScaleX, this.params.brushScaleY);
		this._foregroundContext.drawImage(this._undulatingCanvas, this.params.brushX , this.params.brushY);
		this._foregroundContext.restore();
		 
		this._temporaryContext.clearRect(0, 0, this._temporaryCanvas.width, this._temporaryCanvas.height);
		this._temporaryContext.drawImage(this._backgroundCanvas, 0, -this.params.scrollSpeed); // Shift the background around
		  
		this._backgroundContext.clearRect(0, 0, this._backgroundCanvas.width, this._backgroundCanvas.height);
		this._backgroundContext.drawImage(this._temporaryCanvas, 0, 0); // Probably could take out the temporary canvas and just draw straight to the background at -1 y
		  
		var points = this._getLinePoints(this.params.scanAngle, this.params.brushX + this._undulatingCanvas.width / 2, -this.params.brushY);
		if (points.length > 0)
		{
			this._backgroundContext.save();
			this._backgroundContext.globalCompositeOperation = "multiply";
			this._backgroundContext.drawImage(this._foregroundCanvas, 0, 0);
			this._backgroundContext.restore();
		 
			var left = points[0];
			var right = points[points.length - 1];
		    
			this._backgroundContext.save();
			this._backgroundContext.globalCompositeOperation = "source-over";
			this._backgroundContext.fillStyle = "rgba(255, 255, 255, " + this.params.wipeAlpha + ")"; // The alpha here affects the "windshield wiper effect, controlling how much of the color stays on the screen.
			this._backgroundContext.beginPath();
			this._backgroundContext.moveTo(0, this._backgroundCanvas.height);
			this._backgroundContext.lineTo(0, left.y + this.params.scanHeight);
			this._backgroundContext.lineTo(this._backgroundCanvas.width, right.y + this.params.scanHeight);
			this._backgroundContext.lineTo(this._backgroundCanvas.width, this._backgroundCanvas.height);
			this._backgroundContext.lineTo(0, this._backgroundCanvas.height);
			this._backgroundContext.closePath();
			this._backgroundContext.fill();
			this._backgroundContext.restore();
		  }
		  
		  this._compositeContext.save();
		  this._compositeContext.globalCompositeOperation = "source-over";
		  this._compositeContext.clearRect(0, 0, this._compositeCanvas.width, this._compositeCanvas.height);
		  this._compositeContext.fillStyle = "white";
		  this._compositeContext.fillRect(0, 0, this._compositeContext.width, this._compositeContext.height);
		  this._compositeContext.drawImage(this._backgroundCanvas, 0, 0);
		  this._compositeContext.globalCompositeOperation = "multiply";
		  this._compositeContext.drawImage(this._foregroundCanvas, 0, 0);
		  
		  if (this._logo && this.params.showLogo)
		  {
			  this._compositeContext.globalCompositeOperation = "destination-out";
			  this._compositeContext.drawImage(this._logo, 300, 300);
		  }
		  
		  this._compositeContext.restore();
		  
		  if (this.params.debug)
		  {
		    this._compositeContext.fillStyle = "red";
		    
		    var points = this._getLinePoints(this.params.scanAngle, this.params.brushX + this._undulatingCanvas.width / 2, -this.params.brushY);
		    if (points.length > 0) // Points can be empty for completely vertical lines that have infinite slope
		    {
		      for(i=0; i<points.length; i++)
		      {
		        var point = points[i];
		        this._compositeContext.fillRect(point.x, point.y, 1, 1);
		      }
		    }
		  }
		  
		  this._t++;
		  this._lastRenderTicks = new Date().getTime();
	},
	
	_getLinePoints: function(angle, xIntercept, yIntercept) {
	  angle = angle % (Math.PI * 2);
	  
	  var vertical = Math.PI / 2;
	  var verticalAlternate = Math.PI * 1.5;
	  if (Math.abs(angle - vertical) <= 0.001 || Math.abs(angle - verticalAlternate) <= 0.001) {
	    return [];
	  }
	  
	  var slopeFormula = this._getSlopeFunction(angle, xIntercept, yIntercept);
	  var points = [];
	  for (var x=0; x < this._backgroundCanvas.width; x++) {
	    var y = Math.floor(slopeFormula(x)); // Flooring or ceiling or rounding these coordinates leaves artifacts.
	    points.push({
	      x: x, y: y
	    });
	  }
	  return points;
	},
	
	_getSlopeFunction: function(angle, xIntercept, yIntercept) {
	  return function(x) {
	    var slope = Math.tan(angle);
	    return slope * (x - xIntercept) - yIntercept;
	  }
	}
};