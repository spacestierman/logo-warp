var EffectsRenderer = function(canvas) {
	
	this._source = canvas;
	
	this._canvas = document.createElement("canvas");
	this._canvas.width = this._source.width;
	this._canvas.height = this._source.height;
	this._canvasContext = this._canvas.getContext("2d");
	
	var halfWidth = this._canvas.width / 2;
	var halfHeight = this._canvas.height / 2;
	
	this._scene = new THREE.Scene();
	
	this._camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -10000, 10000);
	this._camera.position.set(0, 0, 1000);
	this._camera.lookAt(this._scene.position);
	
	this._renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });
	this._renderer.setClearColor(0xffffff, 0.0);
	
	this._renderer.setSize(this._canvas.width, this._canvas.height);
	
	this._spriteTexture = new THREE.Texture(this._canvas);
	this._spriteTexture.minFilter = THREE.LinearFilter;
	
	this._spriteMaterial = new THREE.SpriteMaterial({ map: this._spriteTexture });
	this._sprite = new THREE.Sprite(this._spriteMaterial);
	this._sprite.position.set(0, 0, 0);
	this._sprite.scale.set(this._canvas.width, this._canvas.height, 1.0);
	this._scene.add(this._sprite);
	
	this._renderPass = new THREE.RenderPass(this._scene, this._camera);
	this._shaders = [
		this._renderPass
	];
	
	this._setupNewComposer();
};

EffectsRenderer.prototype = {
	getInputCanvas: function() {
		return this._canvas;
	},
	
	getOutputCanvas: function() {
		return this._renderer.domElement;
	},
	
	maybeAddPass: function(shaderPass, reallyAddIt) {
		if (reallyAddIt) {
			this.addPass(shaderPass);
		}
		else if (this.containsPass(shaderPass)) {
			this.removePass(shaderPass);
		}
	},
	
	addPass: function(shaderPass) {
		if (this.containsPass(shaderPass)) {
			this.removePass(shaderPass);
		}
		
		this._shaders.push(shaderPass);
		this._setupNewComposer();
	},
	
	removePass: function(shaderPass) {
		if (this.containsPass(shaderPass)) {
			var index = this._shaders.indexOf(shaderPass);
			this._shaders.splice(index, 1);
			this._setupNewComposer();
		}
	},
	
	containsPass: function(shaderPass) {
		return this._shaders.indexOf(shaderPass) >= 0;	
	},
	
	render: function(totalElapsedMilliseconds) {
		this._canvasContext.drawImage(this._source, 0, 0);
		this._spriteTexture.needsUpdate = true; // In-case the canvas has changed, we need to invalidate the texture every frame, or threejs will cache it.
		
		if (this._shaders.length <= 1) { // If it's only the render pass, just draw the stock scene
			this._renderer.render(this._scene, this._camera);
		}
		else {
			this._composer.render();	
		}
	},
	
	_setupNewComposer: function() {
		this._composer = new THREE.EffectComposer(this._renderer);
		for(var i=0; i<this._shaders.length; i++) {
			var shader = this._shaders[i];
			if (i >= this._shaders.length - 1) { // Make sure the last shader in the list gets displayed
				shader.renderToScreen = true;
			}
			else {
				shader.renderToScreen = false;
			}
			this._composer.addPass(shader);
		}
	}
};

