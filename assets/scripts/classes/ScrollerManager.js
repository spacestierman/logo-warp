var ScrollerManager = function(background, undulatingCanvas, logo, width, height, interactionState) {
	this._background = background;
	this._logo = logo;
	this._interactionState = interactionState;
	
	this._scroller = new Scroller(width, height, undulatingCanvas, null, logo);
	this._scroller.params.showLogo = false;
	this._scrollerWithEffects = new EffectsRenderer(this._scroller.getCanvas());
	
	this._showLogoToggle = new BooleanToggle(this._scroller.params, "showLogo");
	this._scrollSpeedToggle = new AccelerationToggle(this._scroller.params, "scrollSpeed", 1.0, 20.0);
	this._wipeAlphaToggle = new AccelerationToggle(this._scroller.params, "wipeAlpha", 0.05, 1.0);
	this._scanHeightToggle = new AccelerationToggle(this._scroller.params, "scanHeight", 1.0, 100.0);
	this._brushScaleXToggle = new AccelerationToggle(this._scroller.params, "brushScaleX", 1.0, 11.0);
	this._brushScaleYToggle = new AccelerationToggle(this._scroller.params, "brushScaleY", 1.0, 11.0);
	
	this._rgbShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.RGBShiftShader), true);
	this._rgbShader.getParameters().angle = 6.0;
	this._rbgAmountToggle = new AccelerationToggle(this._rgbShader.getParameters(), "amount", 0.001, 0.02);
	
	this._staticShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.StaticShader), true);
	this._staticShader.getParameters().show = false;
	this._staticShader.getParameters().amount = 0.11;
	this._staticShowToggle = new BooleanToggle(this._staticShader.getParameters(), "show", this._setupNewComposer.bind(this));
	this._staticAmountToggle = new AccelerationToggle(this._staticShader.getParameters(), "amount", 0.001, 5.0);
	this._staticSizeToggle = new AccelerationToggle(this._staticShader.getParameters(), "size", 1.0, 20.0);
	
	this._filmShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.FilmShader), false);
	this._filmShader.getParameters().show = false;
	this._filmShader.getParameters().sCount = 1;
	this._filmShader.getParameters().sIntensity = 1.0;
	this._filmShowToggle = new BooleanToggle(this._filmShader.getParameters(), "show", this._setupNewComposer.bind(this));
	this._filmNIntensityToggle = new AccelerationToggle(this._filmShader.getParameters(), "nIntensity", 0.01, 2.0);
	this._filmSIntensityToggle = new AccelerationToggle(this._filmShader.getParameters(), "sIntensity", 0.01, 2.0);
	this._filmLineToggle = new AccelerationToggle(this._filmShader.getParameters(), "sCount", 100, 4096);
	
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
		scrollerGui.add(this._scroller.params, "showLogo").listen();
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
		staticGUI.add(this._staticShader.getParameters(), 'show').listen().onChange(this._setupNewComposer.bind(this));
		staticGUI.add(this._staticShader.getParameters(), 'amount', 0.0, 5.0).listen().name("Amount");
		staticGUI.add(this._staticShader.getParameters(), 'size', 0.0, 20.0).listen().name("Size");
		//staticGUI.open();
		
		var filmGUI = gui.addFolder('Film Shader');
		filmGUI.add(this._filmShader.getParameters(), 'show').listen().onChange(this._setupNewComposer.bind(this));
		filmGUI.add(this._filmShader.getParameters(), 'nIntensity', 0.0, 2.0).listen().name("N Intensity");
		filmGUI.add(this._filmShader.getParameters(), 'sIntensity', 0.0, 2.0).listen().step(0.1).name("S Intensity");
		filmGUI.add(this._filmShader.getParameters(), 'sCount', 0, 4096).listen().name("Line Count");
		//filmGUI.open();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(this._tvShader.getParameters(), 'show').listen().onChange(this._setupNewComposer.bind(this));
		tvGui.add(this._tvShader.getParameters(), 'distortion', 0.1, 20).listen().name("Thick Distort");
		tvGui.add(this._tvShader.getParameters(), 'distortion2', 0.1, 20).listen().step(0.1).name("Fine Distort");
		tvGui.add(this._tvShader.getParameters(), 'speed', 0.0, 1.0).listen().name("Distort Speed");
		tvGui.add(this._tvShader.getParameters(), 'rollSpeed', 0.0,1.0).step(0.01).listen().name("Roll Speed");
		//tvGui.open();
	},
	
	_updateShaderValues: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._scrollSpeedToggle.update(this._interactionState.isMouseDown() || this._interactionState.isKeyDown(KeyCodes.SPACEBAR));
		this._wipeAlphaToggle.update(this._interactionState.isKeyDown(KeyCodes.W));
		this._showLogoToggle.update(this._interactionState.isKeyDown(KeyCodes.S));
		this._scanHeightToggle.update(this._interactionState.isKeyDown(KeyCodes.Q));
		this._brushScaleXToggle.update(this._interactionState.isKeyDown(KeyCodes.E));
		this._brushScaleYToggle.update(this._interactionState.isKeyDown(KeyCodes.M));
		this._scroller.params.brushAngle = Math.sin(totalElapsedMilliseconds/ 10000) * 2 * Math.PI;
		
		this._staticShowToggle.update(this._interactionState.isKeyDown(KeyCodes.Z) || this._interactionState.isKeyDown(KeyCodes.X));
		this._staticAmountToggle.update(this._interactionState.isKeyDown(KeyCodes.Z));
		this._staticSizeToggle.update(this._interactionState.isKeyDown(KeyCodes.X));
		this._staticShader.updateShaderToParameters({
			time:  totalElapsedMilliseconds / 10000
		});
		
		this._rgbShader.getParameters().angle = Math.sin(totalElapsedMilliseconds/ 5000) * 2 * Math.PI;
		this._rbgAmountToggle.update(this._interactionState.isKeyDown(KeyCodes.C)); 
		this._rgbShader.updateShaderToParameters();
		
		this._tvShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		})
		
		this._filmShowToggle.update(this._interactionState.isKeyDown(KeyCodes.R) || this._interactionState.isKeyDown(KeyCodes.F) || this._interactionState.isKeyDown(KeyCodes.V));
		this._filmNIntensityToggle.update(this._interactionState.isKeyDown(KeyCodes.R));
		this._filmSIntensityToggle.update(this._interactionState.isKeyDown(KeyCodes.F));
		this._filmLineToggle.update(this._interactionState.isKeyDown(KeyCodes.V));
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