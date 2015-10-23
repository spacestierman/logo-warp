/* global totalElapsedMilliseconds */
$( document ).ready(function() {
	var _logo = document.getElementById("logo");
	if (_logo == null)
	{
		throw "no logo";
	}
	var _undulating = new UndulatingLogo(_logo, 400, 150, "undulating");
	var _undulatingCanvas = _undulating.getCanvas(); 
	
	var _scene = new THREE.Scene();
	var halfWidth = _undulatingCanvas.width / 2;
	var halfHeight = _undulatingCanvas.height / 2;
	var _camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 1000);
	_camera.position.set(0, 0, 1000);
	_camera.lookAt(_scene.position);
	
	var _renderer = new THREE.WebGLRenderer({ alpha:true, preserveDrawingBuffer: true });
	_renderer.setClearColor(0xffffff, 1.0);
	
	_renderer.setSize(_undulatingCanvas.width, _undulatingCanvas.height);
	_renderer.domElement.id = "renderer";
	
	var _fuzz = document.getElementById("fuzz");
	var _background = new Background(window.innerWidth, window.innerHeight, _fuzz, ["The truth is out there", "I'm all out of bubblegum"]);
	
	var _scroller = new Scroller(window.innerWidth, window.innerHeight, _renderer.domElement, _background.getDomElement(), _undulatingCanvas);
	_scroller.params.showLogo = false;
	_scroller.params.brushScaleX = 3.9;
	_scroller.params.brushScaleY = 11.0;
	_scroller.params.wipeAlpha = 0.11;
	var _scrollerCanvas = _scroller.getCanvas();
	var _scrollerWithEffects = new EffectsRenderer(_scrollerCanvas);
	
	var _spriteTexture = new THREE.Texture(_undulatingCanvas);
	_spriteTexture.minFilter = THREE.LinearFilter;
	var _spriteMaterial = new THREE.SpriteMaterial({ map: _spriteTexture });
	
	var _sprite = new THREE.Sprite(_spriteMaterial);
	_sprite.position.set(0, 0, 0);
	_sprite.scale.set(_undulatingCanvas.width, _undulatingCanvas.height, 1.0);
	_scene.add(_sprite);
	
	var _renderPass = new THREE.RenderPass(_scene, _camera)
	var _bleachShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.BleachBypassShader), true);
	var _rgbShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.RGBShiftShader), true);
	var _staticShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.StaticShader), true);
	var _filmShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.FilmShader), true);
	var _tvShader = new ShaderPassParameters(new THREE.ShaderPass(THREE.BadTVShader), true);
	
	var _startedAt = new Date().getTime();
	var _lastRenderTicks = _startedAt;
	var _t = 0;
	
	//document.body.appendChild(_background.getDomElement());
	document.body.appendChild(_scrollerWithEffects.getOutputCanvas());
	//document.body.appendChild(_scrollerCanvas);
	//document.body.appendChild(_undulatingCanvas);
	
	
	setupNewComposer();
	setupDatGUI();
	render();
	function render() 
	{
		var nowTicks = new Date().getTime();
		var totalElapsedMilliseconds = _lastRenderTicks - _startedAt;
		var deltaMilliseconds = nowTicks - _lastRenderTicks;
		console.log("totalElapsedMilliseconds: " + totalElapsedMilliseconds + "ms @" + _t + " dT:" + deltaMilliseconds + "ms");
		
		updateShadersFromGUI(totalElapsedMilliseconds, deltaMilliseconds);
		
		_background.render(totalElapsedMilliseconds);
		_undulating.render(totalElapsedMilliseconds);
		_scroller.render();
		
		_spriteTexture.needsUpdate = true; // We need to invalidate the texture every frame, or threejs will cache it.
		
		_composer.render();
		
		_scrollerWithEffects.render(totalElapsedMilliseconds);
		
		_lastRenderTicks = new Date().getTime();
		_t += 0.1;
		
		requestAnimationFrame(render);
	}
	
	function setupDatGUI() {
		buildMiniGUI();
		buildOutputGUI();
	}
	
	function buildOutputGUI() {
		var gui = new dat.GUI();
		
		var scrollerGui = gui.addFolder('Scroller');
		scrollerGui.add(_scroller.params, 'debug')
		scrollerGui.add(_scroller.params, "showLogo");
		scrollerGui.add(_scroller.params, "scrollSpeed", 0.01, 20).name("Scroll Speed");
		scrollerGui.add(_scroller.params, "wipeAlpha", 0.01, 1.0).name("Wipe Alpha");
		scrollerGui.add(_scroller.params, "scanAngle", 0.01, Math.PI * 2).name("Scan Angle");
		scrollerGui.add(_scroller.params, "scanHeight", 1, 100).name("Scan Height");
		scrollerGui.add(_scroller.params, "brushAngle", 0.01, Math.PI * 2).name("Brush Angle");
		scrollerGui.add(_scroller.params, "brushX", -window.innerWidth, window.innerWidth).name("Brush X");
		scrollerGui.add(_scroller.params, "brushY", -window.innerHeight, window.innerHeight).name("Brush Y");
		scrollerGui.add(_scroller.params, "brushScaleX", 0.0, 11.0).name("Brush Scale X");
		scrollerGui.add(_scroller.params, "brushScaleY", 0.0, 11.0).name("Brush Scale Y");
		scrollerGui.open();
		
		var staticGUI = gui.addFolder('Static');
		staticGUI.add(_staticShader.getParameters(), 'show').onChange(setupNewComposer);
		staticGUI.add(_staticShader.getParameters(), 'amount', 0.0, 5.0).name("Amount");
		staticGUI.add(_staticShader.getParameters(), 'size', 0.0, 20.0).name("Size");
		staticGUI.open();
		
		var filmGUI = gui.addFolder('Film Shader');
		filmGUI.add(_filmShader.getParameters(), 'show').onChange(setupNewComposer);
		filmGUI.add(_filmShader.getParameters(), 'nIntensity', 0.0, 2.0).name("N Intensity");
		filmGUI.add(_filmShader.getParameters(), 'sIntensity', 0.0, 2.0).step(0.1).name("S Intensity");
		filmGUI.add(_filmShader.getParameters(), 'sCount', 0, 4096).name("Line Count");
		filmGUI.add(_filmShader.getParameters(), 'grayscale').name("Is Greyscale?");
		filmGUI.open();
	}
	
	function buildMiniGUI() {
		var gui = new dat.GUI();
		
		var rgbGui = gui.addFolder('RGB Split');
		rgbGui.add(_rgbShader.getParameters(), 'show').onChange(setupNewComposer);
		rgbGui.add(_rgbShader.getParameters(), 'amount', 0.0, 0.02).name("Amount");
		rgbGui.add(_rgbShader.getParameters(), 'angle', 0.0, Math.PI * 2).name("Angle");
		rgbGui.open();
		
		var bleachGUI = gui.addFolder('Bleach');
		bleachGUI.add(_bleachShader.getParameters(), 'show').onChange(setupNewComposer);
		bleachGUI.add(_bleachShader.getParameters(), 'opacity', 1.0, 10.0).name("Opacity");
		bleachGUI.open();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(_tvShader.getParameters(), 'show').onChange(setupNewComposer);
		tvGui.add(_tvShader.getParameters(), 'distortion', 0.1, 20).name("Thick Distort");
		tvGui.add(_tvShader.getParameters(), 'distortion2', 0.1, 20).step(0.1).name("Fine Distort");
		tvGui.add(_tvShader.getParameters(), 'speed', 0.0, 1.0).name("Distort Speed");
		tvGui.add(_tvShader.getParameters(), 'rollSpeed', 0.0,1.0).name("Roll Speed");
		tvGui.open();
	}
	
	function updateShadersFromGUI(totalElapsedMilliseconds, deltaMilliseconds) {
		_staticShader.updateShaderToParameters({
			time:  totalElapsedMilliseconds / 10000
		});
		
		_bleachShader.updateShaderToParameters();
		_rgbShader.updateShaderToParameters();
		
		_tvShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		})
		
		_filmShader.updateShaderToParameters({
			time: totalElapsedMilliseconds / 10000
		});
	}
	
	function setupNewComposer()  {
		var shaders = [
			_renderPass,
		];
		
		_scrollerWithEffects.maybeAddPass(_rgbShader.getShader(), _rgbShader.getParameters().show);
		
		if (_bleachShader.getParameters().show)
		{
			shaders.push(_bleachShader.getShader());
		}
		
		_scrollerWithEffects.maybeAddPass(_tvShader.getShader(), _tvShader.getParameters().show);
		_scrollerWithEffects.maybeAddPass(_staticShader.getShader(), _staticShader.getParameters().show);
		_scrollerWithEffects.maybeAddPass(_filmShader.getShader(), _filmShader.getParameters().show);
		
		_composer = new THREE.EffectComposer(_renderer);
		for(var i=0; i<shaders.length; i++) {
			var shader = shaders[i];
			if (i >= shaders.length - 1) { // Make sure the last shader in the list gets displayed
				shader.renderToScreen = true;
			}
			_composer.addPass(shader);
		}
	}
});