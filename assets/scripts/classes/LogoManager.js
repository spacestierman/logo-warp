var LogoManager = function() {
	this._logoMain = new Logo(document.getElementById("logo-large")) 
	this._logoMainWithEffects = new EffectsRenderer(this._logoMain.getDomElement());
	
	this._tvShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.BadTVShader), true);
	this._tvShader.getParameters().distortion = 3.0;
	this._tvShader.getParameters().distortion2 = 0;
	this._tvShader.getParameters().speed = 0.10;
	this._tvShader.getParameters().rollSpeed = 0.0;
	
	this._mirrorShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.MirrorShader), true);
	this._mirrorShader.getParameters().show = false;
	
	this._setupNewComposer();
};

LogoManager.prototype = {
	getDomElement: function() {
		return this._logoMainWithEffects.getOutputCanvas();
	},
	
	getLogoCanvas: function() {
		return this._logoMain.getDomElement();
	},
	
	render: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._logoMain.render(totalElapsedMilliseconds);
		
		this._updateShaderValues(totalElapsedMilliseconds, deltaMilliseconds);
		this._logoMainWithEffects.render(totalElapsedMilliseconds);
	},	
	
	showDatGUI: function() {
		var gui = new dat.GUI();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(this._tvShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		tvGui.add(this._tvShader.getParameters(), 'distortion', 0.1, 20).name("Thick Distort");
		tvGui.add(this._tvShader.getParameters(), 'distortion2', 0.1, 20).name("Fine Distort");
		tvGui.add(this._tvShader.getParameters(), 'speed', 0.0, 1.0).name("Distort Speed");
		tvGui.add(this._tvShader.getParameters(), 'rollSpeed', 0.0,1.0).name("Roll Speed");
		//tvGui.open();
		
		var mirrorGui = gui.addFolder('Mirror');
		mirrorGui.add(this._mirrorShader.getParameters(), 'show').onChange(this._setupNewComposer.bind(this));
		mirrorGui.add(this._mirrorShader.getParameters(), 'side', { Left: 0, Right: 1, Top: 2, Bottom: 3 } ).name("Side");
		//tvGui.open();
	},
	
	_updateShaderValues: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._tvShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		});
		
		this._mirrorShader.updateShaderToParameters();
	},
	
	_setupNewComposer: function() {
		this._logoMainWithEffects.maybeAddPass(this._mirrorShader.getShader(), this._mirrorShader.getParameters().show);
		this._logoMainWithEffects.maybeAddPass(this._tvShader.getShader(), this._tvShader.getParameters().show);
	}
};