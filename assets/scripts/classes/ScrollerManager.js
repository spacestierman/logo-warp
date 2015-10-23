var ScrollerManager = function(background, undulatingCanvas, logo) {
	this._background = background;
	this._logo = logo;
	
	this._scroller = new Scroller(window.innerWidth, window.innerHeight, undulatingCanvas, null, logo);
	this._scroller.params.showLogo = false;
	this._scroller.params.scrollSpeed = 5;
	this._scroller.params.scanHeight = 100;
	this._scroller.params.brushY = 58;
	this._scroller.params.brushScaleX = 3.9;
	this._scroller.params.brushScaleY = 11.0;
	this._scroller.params.wipeAlpha = 0.01;
	
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
		
		var logoAt = {
			x: Math.floor(this._composite.width / 2 - this._logo.width / 2),
			y: Math.floor(this._composite.height / 2 - this._logo.height / 2),
		};
		
		this._compositeContext.drawImage(this._logo, logoAt.x, logoAt.y);
		
		this._compositeContext.restore();
	},
	
	showDatGUI: function() {
		var gui = new dat.GUI();
		
		var scrollerGui = gui.addFolder('Scroller');
		scrollerGui.add(this._scroller.params, 'debug')
		scrollerGui.add(this._scroller.params, "showLogo");
		scrollerGui.add(this._scroller.params, "scrollSpeed", 0.01, 20).name("Scroll Speed");
		scrollerGui.add(this._scroller.params, "wipeAlpha", 0.01, 1.0).name("Wipe Alpha");
		scrollerGui.add(this._scroller.params, "scanAngle", 0.01, Math.PI * 2).name("Scan Angle");
		scrollerGui.add(this._scroller.params, "scanHeight", 1, 100).name("Scan Height");
		scrollerGui.add(this._scroller.params, "brushAngle", 0.01, Math.PI * 2).name("Brush Angle");
		scrollerGui.add(this._scroller.params, "brushX", -window.innerWidth, window.innerWidth).name("Brush X");
		scrollerGui.add(this._scroller.params, "brushY", -window.innerHeight, window.innerHeight).name("Brush Y");
		scrollerGui.add(this._scroller.params, "brushScaleX", 0.0, 11.0).name("Brush Scale X");
		scrollerGui.add(this._scroller.params, "brushScaleY", 0.0, 11.0).name("Brush Scale Y");
		//scrollerGui.open();
		
		var rgbGui = gui.addFolder('RGB Split');
		rgbGui.add(this._rgbShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		rgbGui.add(this._rgbShader.getParameters(), 'amount', 0.0, 0.02).name("Amount");
		rgbGui.add(this._rgbShader.getParameters(), 'angle', 0.0, Math.PI * 2).name("Angle");
		//rgbGui.open();
		
		var staticGUI = gui.addFolder('Static');
		staticGUI.add(this._staticShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		staticGUI.add(this._staticShader.getParameters(), 'amount', 0.0, 5.0).name("Amount");
		staticGUI.add(this._staticShader.getParameters(), 'size', 0.0, 20.0).name("Size");
		//staticGUI.open();
		
		var filmGUI = gui.addFolder('Film Shader');
		filmGUI.add(this._filmShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		filmGUI.add(this._filmShader.getParameters(), 'nIntensity', 0.0, 2.0).name("N Intensity");
		filmGUI.add(this._filmShader.getParameters(), 'sIntensity', 0.0, 2.0).step(0.1).name("S Intensity");
		filmGUI.add(this._filmShader.getParameters(), 'sCount', 0, 4096).name("Line Count");
		filmGUI.add(this._filmShader.getParameters(), 'grayscale').name("Is Greyscale?");
		//filmGUI.open();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(this._tvShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		tvGui.add(this._tvShader.getParameters(), 'distortion', 0.1, 20).name("Thick Distort");
		tvGui.add(this._tvShader.getParameters(), 'distortion2', 0.1, 20).step(0.1).name("Fine Distort");
		tvGui.add(this._tvShader.getParameters(), 'speed', 0.0, 1.0).name("Distort Speed");
		tvGui.add(this._tvShader.getParameters(), 'rollSpeed', 0.0,1.0).name("Roll Speed");
		//tvGui.open();
	},
	
	_updateShaderValues: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._staticShader.updateShaderToParameters({
			time:  totalElapsedMilliseconds / 10000
		});
		
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
	}
};