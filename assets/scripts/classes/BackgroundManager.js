var BackgroundManager = function(width, height) {
	var fuzz = document.getElementById("fuzz");
	var messages = [
		"Can you ever really know yourself? ",
		"We are an ever-evolving species and the future is already the past. ",
		"Keep seeking, keep questioning. ",
		"Search for what is beyond the stars. ",
		"Your identity is the one true currency. ",
		"You are a changeling, bold and vibrating with energy. ",
		"From destruction to evolution, your star will never die. "
	];
	this._background = new Background(width, height, fuzz, messages);
	this._background.getParameters().stepHeightInPixels = 50;
	this._background.getParameters().fontAlpha = 0.07;
	
	this._backgroundWithEffects = new EffectsRenderer(this._background.getDomElement());
	
	this._rgbShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.RGBShiftShader), false);
	this._mirrorShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.MirrorShader), false);
	this._staticShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.StaticShader), false);
	this._staticShader.getParameters().amount = 0.11;
	this._blurShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.HorizontalBlurShader), true);
	this._blurShader.getParameters().h = 0.0011;
	
	this._setupNewComposer();
};

BackgroundManager.prototype = {
	getDomElement: function() {
		return this._backgroundWithEffects.getOutputCanvas();
	},
	
	getBackgroundCanvas: function() {
		return this._background.getDomElement();
	},
	
	render: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._background.render(totalElapsedMilliseconds);
		
		this._updateShaderValues(totalElapsedMilliseconds, deltaMilliseconds);
		this._backgroundWithEffects.render(totalElapsedMilliseconds);
	},
	
	showDatGUI: function() {
		var gui = new dat.GUI();
		
		var backgroundFolder = gui.addFolder("Background");
		backgroundFolder.add(this._background.getParameters(), "fontSizeInPixels", 1, 100).listen().name("Font Size");
		backgroundFolder.add(this._background.getParameters(), "fontAlpha", 0.01, 1.0).listen().name("Font Alpha");
		backgroundFolder.add(this._background.getParameters(), "stepHeightInPixels", 1, 100).listen().name("Step Height");
		//backgroundFolder.open();
		
		var rgbGui = gui.addFolder('RGB Split');
		rgbGui.add(this._rgbShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		rgbGui.add(this._rgbShader.getParameters(), 'amount', 0.0, 0.02).name("Amount");
		rgbGui.add(this._rgbShader.getParameters(), 'angle', 0.0, Math.PI * 2).name("Angle");
		//rgbGui.open();
		
		var mirrorGui = gui.addFolder('Mirror');
		mirrorGui.add(this._mirrorShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		mirrorGui.add(this._mirrorShader.getParameters(), 'side', { Left: 0, Right: 1, Top: 2, Bottom: 3 } ).name("Side");
		//tvGui.open();
		
		var blurGUI = gui.addFolder('Blur');
		blurGUI.add(this._blurShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		blurGUI.add(this._blurShader.getParameters(), 'h', 0.0, 1.0).name("Amount");
		//staticGUI.open();
		
		var staticGUI = gui.addFolder('Static');
		staticGUI.add(this._staticShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		staticGUI.add(this._staticShader.getParameters(), 'amount', 0.0, 5.0).name("Amount");
		staticGUI.add(this._staticShader.getParameters(), 'size', 0.0, 20.0).name("Size");
		//staticGUI.open();
	},
	
	_updateShaderValues: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._rgbShader.updateShaderToParameters();
		this._mirrorShader.updateShaderToParameters();
		this._blurShader.updateShaderToParameters();
		this._staticShader.updateShaderToParameters({
			time:  totalElapsedMilliseconds / 10000
		});
	},
	
	_setupNewComposer: function() {
		this._backgroundWithEffects.maybeAddPass(this._rgbShader.getShader(), this._rgbShader.getParameters().show);
		this._backgroundWithEffects.maybeAddPass(this._mirrorShader.getShader(), this._mirrorShader.getParameters().show);
		this._backgroundWithEffects.maybeAddPass(this._blurShader.getShader(), this._blurShader.getParameters().show);
		this._backgroundWithEffects.maybeAddPass(this._staticShader.getShader(), this._staticShader.getParameters().show);
	}
};