var ScrollerManager = function(background, undulatingCanvas, logo, width, height) {
	this._background = background;
	this._logo = logo;
	
	this._scroller = new Scroller(width, height, undulatingCanvas, null, logo);
	this._scroller.params.showLogo = false;
	this._originalBrushX = this._scroller.params.brushX;
	//this._scroller.params.scrollSpeed = 5;
	//this._scroller.params.scanHeight = 100;
	//this._scroller.params.brushY = 58;
	//this._scroller.params.brushScaleX = 3.9;
	//this._scroller.params.brushScaleY = 11.0;
	//this._scroller.params.wipeAlpha = 0.01;
	
	this._scrollerWithEffects = new EffectsRenderer(this._scroller.getCanvas());
	
	this._rgbShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.RGBShiftShader), true);
	this._rgbShader.getParameters().angle = 6.0;
	
	this._staticShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.StaticShader), true);
	this._staticShader.getParameters().show = false;
	this._staticShader.getParameters().amount = 0.11;
	this._filmShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.FilmShader), false);
	this._tvShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.BadTVShader), true);
	this._tvShader.getParameters().distortion = 11.1;
	this._tvShader.getParameters().distortion2 = 0.0;
	this._tvShader.getParameters().rollSpeed = 0.0;

	this._composite = document.createElement('canvas');
	this._composite.width = window.innerWidth;
	this._composite.height = window.innerHeight;
	this._compositeContext = this._composite.getContext('2d');
	
	this._setupNewComposer();
};

ScrollerManager.prototype = {
	getDomElement: function() {
		return this._composite;
	},
	
	getScrollerCanvas: function() {
		return this._scroller.getCanvas();
	},
	
	render: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._updateShaderValues(totalElapsedMilliseconds, deltaMilliseconds);
		
		this._scroller.render();
		this._scrollerWithEffects.render(totalElapsedMilliseconds);
		
		this._compositeContext.save();
		this._compositeContext.globalCompositeOperation = "multiply";
		
		this._compositeContext.clearRect(0, 0, this._composite.width, this._composite.height);
		this._compositeContext.drawImage(this._background, 0, 0);
		this._compositeContext.drawImage(this._scrollerWithEffects.getOutputCanvas(), 0, 0);
		
		var logoScale = this._calculateLogoScale();
		
		var logoAt = {
			x: Math.floor(this._composite.width / 2 - this._logo.width * logoScale / 2),
			y: Math.floor(this._composite.height / 2 - this._logo.height * logoScale / 2),
		};
		
		this._compositeContext.translate(logoAt.x, logoAt.y);
		this._compositeContext.scale(logoScale, logoScale);
		this._compositeContext.drawImage(this._logo, 0, 0);
		
		this._compositeContext.restore();
	},
	
	showDatGUI: function() {
		var gui = new dat.GUI();
		
		var scrollerGui = gui.addFolder('Scroller');
		scrollerGui.add(this._scroller.params, "showLogo");
		scrollerGui.add(this._scroller.params, "scrollSpeed", 0.01, 20).listen().name("Scroll Speed");
		scrollerGui.add(this._scroller.params, "wipeAlpha", 0.01, 1.0).listen().name("Wipe Alpha");
		scrollerGui.add(this._scroller.params, "scanAngle", 0.01, Math.PI * 2).listen().name("Scan Angle");
		scrollerGui.add(this._scroller.params, "scanHeight", 1, 100).listen().name("Scan Height");
		scrollerGui.add(this._scroller.params, "brushAngle", 0.01, Math.PI * 2).listen().name("Brush Angle");
		scrollerGui.add(this._scroller.params, "brushX", -window.innerWidth, window.innerWidth).listen().name("Brush X");
		scrollerGui.add(this._scroller.params, "brushY", -window.innerHeight, window.innerHeight).listen().name("Brush Y");
		scrollerGui.add(this._scroller.params, "brushScaleX", 0.0, 11.0).listen().name("Brush Scale X");
		scrollerGui.add(this._scroller.params, "brushScaleY", 0.0, 11.0).listen().name("Brush Scale Y");
		//scrollerGui.open();
		
		var rgbGui = gui.addFolder('RGB Split');
		rgbGui.add(this._rgbShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		rgbGui.add(this._rgbShader.getParameters(), 'amount', 0.0, 0.02).listen().name("Amount");
		rgbGui.add(this._rgbShader.getParameters(), 'angle', 0.0, Math.PI * 2).listen().name("Angle");
		//rgbGui.open();
		
		var staticGUI = gui.addFolder('Static');
		staticGUI.add(this._staticShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		staticGUI.add(this._staticShader.getParameters(), 'amount', 0.0, 5.0).listen().name("Amount");
		staticGUI.add(this._staticShader.getParameters(), 'size', 0.0, 20.0).listen().name("Size");
		//staticGUI.open();
		
		var filmGUI = gui.addFolder('Film Shader');
		filmGUI.add(this._filmShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		filmGUI.add(this._filmShader.getParameters(), 'nIntensity', 0.0, 2.0).listen().name("N Intensity");
		filmGUI.add(this._filmShader.getParameters(), 'sIntensity', 0.0, 2.0).listen().step(0.1).name("S Intensity");
		filmGUI.add(this._filmShader.getParameters(), 'sCount', 0, 4096).listen().name("Line Count");
		filmGUI.add(this._filmShader.getParameters(), 'grayscale').listen().name("Is Greyscale?");
		//filmGUI.open();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(this._tvShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		tvGui.add(this._tvShader.getParameters(), 'distortion', 0.1, 20).listen().name("Thick Distort");
		tvGui.add(this._tvShader.getParameters(), 'distortion2', 0.1, 20).listen().step(0.1).name("Fine Distort");
		tvGui.add(this._tvShader.getParameters(), 'speed', 0.0, 1.0).listen().name("Distort Speed");
		tvGui.add(this._tvShader.getParameters(), 'rollSpeed', 0.0,1.0).step(0.01).listen().name("Roll Speed");
		//tvGui.open();
	},
	
	_updateShaderValues: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._scroller.params.brushAngle = Math.sin(totalElapsedMilliseconds/ 10000) * 2 * Math.PI;
		
		this._staticShader.updateShaderToParameters({
			time:  totalElapsedMilliseconds / 10000
		});
		
		this._rgbShader.getParameters().angle = Math.sin(totalElapsedMilliseconds/ 5000) * 2 * Math.PI; 
		this._rgbShader.updateShaderToParameters();
		
		this._tvShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		})
		
		this._filmShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		});
	},
	
	_setupNewComposer: function() {
		this._scrollerWithEffects.maybeAddPass(this._rgbShader.getShader(), this._rgbShader.getParameters().show);
		this._scrollerWithEffects.maybeAddPass(this._tvShader.getShader(), this._tvShader.getParameters().show);
		this._scrollerWithEffects.maybeAddPass(this._staticShader.getShader(), this._staticShader.getParameters().show);
		this._scrollerWithEffects.maybeAddPass(this._filmShader.getShader(), this._filmShader.getParameters().show);
	},
	
	_calculateLogoScale: function() {
		var ratioWidth = this._composite.width / this._logo.width;
		ratioWidth = Math.min(1.0, ratioWidth);
		
		var ratioHeight = this._composite.height / this._logo.height;
		ratioHeight = Math.min(1.0, ratioHeight);
		
		var lowestRatio = Math.min(ratioWidth, ratioHeight);
		return lowestRatio;
	}
};