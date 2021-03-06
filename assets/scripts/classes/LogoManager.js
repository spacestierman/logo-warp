var LogoManager = function(interactionState) {
	this._interactionState = interactionState;
	
	this._logoMain = new Logo(document.getElementById("logo-large")) 
	this._logoMainWithEffects = new EffectsRenderer(this._logoMain.getDomElement());
	
	this._rgbShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.RGBShiftShader), true);
	this._rgbShader.getParameters().angle = 1.8;
	this._rgbShader.getParameters().amount = 0.0044;
	this._rbgAmountToggle = new AccelerationToggle(this._rgbShader.getParameters(), "amount", 0.001, 0.02);
	this._rbgAngleToggle = new AccelerationToggle(this._rgbShader.getParameters(), "angle", 0.05, Math.PI * 2);
	
	this._tvShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.BadTVShader), true);
	this._tvShader.getParameters().distortion = 3.0;
	this._tvShader.getParameters().distortion2 = 0;
	this._tvShader.getParameters().speed = 0.10;
	this._tvShader.getParameters().rollSpeed = 0.0;
	this._tvFineDistortionToggle = new AccelerationToggle(this._tvShader.getParameters(), "distortion2", 0.5, 20.0);
	this._tvSpeedToggle = new SetValueToggle(this._tvShader.getParameters(), "speed", 1.0);
	
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
		var start = new Date().getTime();
		this._logoMain.render(totalElapsedMilliseconds);
		
		this._updateShaderValues(totalElapsedMilliseconds, deltaMilliseconds);
		this._logoMainWithEffects.render(totalElapsedMilliseconds);
		
		var end = new Date().getTime();
		var duration = end - start;
		console.log("Main Logo render duration: " + duration + "ms");
	},	
	
	showDatGUI: function() {
		var gui = new dat.GUI();
		
		var rgbGui = gui.addFolder('RGB Split');
		rgbGui.add(this._rgbShader.getParameters(), 'show').listen().onChange(this._setupNewComposer.bind(this));
		rgbGui.add(this._rgbShader.getParameters(), 'amount', 0.0, 0.02).listen().name("Amount");
		rgbGui.add(this._rgbShader.getParameters(), 'angle', 0.0, Math.PI * 2).listen().name("Angle");
		//rgbGui.open();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(this._tvShader.getParameters(), 'show').listen().onChange(this._setupNewComposer.bind(this));
		tvGui.add(this._tvShader.getParameters(), 'distortion', 0.1, 20).listen().name("Thick Distort");
		tvGui.add(this._tvShader.getParameters(), 'distortion2', 0.1, 20).listen().name("Fine Distort");
		tvGui.add(this._tvShader.getParameters(), 'speed', 0.0, 1.0).listen().name("Distort Speed");
		tvGui.add(this._tvShader.getParameters(), 'rollSpeed', 0.0,1.0).listen().name("Roll Speed");
		//tvGui.open();
		
		var mirrorGui = gui.addFolder('Mirror');
		mirrorGui.add(this._mirrorShader.getParameters(), 'show').listen().onChange(this._setupNewComposer.bind(this));
		mirrorGui.add(this._mirrorShader.getParameters(), 'side', { Left: 0, Right: 1, Top: 2, Bottom: 3 } ).listen().name("Side");
		//tvGui.open();
	},
	
	_updateShaderValues: function(totalElapsedMilliseconds, deltaMilliseconds) {
		this._rbgAmountToggle.update(this._interactionState.isKeyDown(KeyCodes.T));
		this._rbgAngleToggle.update(this._interactionState.isKeyDown(KeyCodes.G));
		this._rgbShader.updateShaderToParameters();
		
		this._tvFineDistortionToggle.update(this._interactionState.isKeyDown(KeyCodes.B));
		this._tvSpeedToggle.update(this._interactionState.isKeyDown(KeyCodes.N));
		this._tvShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		});
		
		this._mirrorShader.updateShaderToParameters();
	},
	
	_setupNewComposer: function() {
		this._logoMainWithEffects.maybeAddPass(this._rgbShader.getShader(), this._rgbShader.getParameters().show);
		this._logoMainWithEffects.maybeAddPass(this._mirrorShader.getShader(), this._mirrorShader.getParameters().show);
		this._logoMainWithEffects.maybeAddPass(this._tvShader.getShader(), this._tvShader.getParameters().show);
	}
};