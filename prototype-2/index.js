/* global totalElapsedMilliseconds */
$( document ).ready(function() {
	var _logo = document.getElementById("logo");
	var _undulating = new UndulatingLogo(_logo, 400, 150, "undulating");
	var _undulatingCanvas = _undulating.getCanvas(); 
	
	var _temp = document.createElement('canvas')
	
	var _scene = new THREE.Scene();
	var halfWidth = _undulatingCanvas.width;
	var halfHeight = _undulatingCanvas.height;
	var _camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 1000);
	_camera.position.set(0, 0, 1000);
	_camera.lookAt(_scene.position);
	
	var _renderer = new THREE.WebGLRenderer({ alpha:true, preserveDrawingBuffer: true });
	_renderer.setClearColor(0xffffff, 1.0);
	
	_renderer.setSize(_undulatingCanvas.width, _undulatingCanvas.height);
	_renderer.domElement.id = "renderer";
	
	var _scroller = new Scroller(window.innerWidth, window.innerHeight, _renderer.domElement, _undulatingCanvas);
	var _scrollerCanvas = _scroller.getCanvas();
	
	var _spriteTexture = new THREE.Texture(_undulatingCanvas);
	var _spriteMaterial = new THREE.SpriteMaterial({ map: _spriteTexture });
	var _sprite = new THREE.Sprite(_spriteMaterial);
	_sprite.position.set(0, 0, 0);
	_sprite.scale.set(_undulatingCanvas.width * 2, _undulatingCanvas.height * 2, 1.0);
	_scene.add(_sprite);
	
	var _renderPass = new THREE.RenderPass(_scene, _camera)
	
	var _bleachPass = new THREE.ShaderPass( THREE.BleachBypassShader );
	_bleachPass.uniforms["opacity"].value = 3.0;

	var _rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
	var _rgbEffectParams = {
		show: true,
		tDiffuse: null,
		amount: 0.005,
		angle: 0.0	
	};
	
	var _tvShader = new THREE.ShaderPass(THREE.BadTVShader);
	var _tvShaderParams = {
		show: true,
		tDiffuse: null,
		time: 0.0,
		distortion: 0.0,
		distortion2: 5.0,
		speed: 0.2,
		rollSpeed: 0.0
	};
	
	var _shaders = [
		_renderPass,
		_tvShader,
		_bleachPass,
		_rgbEffect
	];
		
	_composer = new THREE.EffectComposer(_renderer);
	for(var i=0; i<_shaders.length; i++) {
		var shader = _shaders[i];
		if (i >= _shaders.length - 1) { // Make sure the last shader in the list gets displayed
			shader.renderToScreen = true;
		}
		_composer.addPass(shader);
	}
	
	var _startedAt = new Date().getTime();
	var _lastRenderTicks = _startedAt;
	
	document.body.appendChild(_scrollerCanvas);
	
	setupDatGUI();
	render();
	function render() 
	{
		var nowTicks = new Date().getTime();
		var totalElapsedMilliseconds = _startedAt - _lastRenderTicks;
		
		updateShadersFromGUI();
		
		_undulating.render(totalElapsedMilliseconds);
		_scroller.render();
		
		_spriteTexture.needsUpdate = true; // We need to invalidate the texture every frame, or threejs will cache it.
		
		_tvShader.uniforms["time"].value = totalElapsedMilliseconds;
		
		_composer.render();
		
		_lastRenderTicks = new Date().getTime();
		
		requestAnimationFrame(render);
	}
	
	function setupDatGUI() {
		var gui = new dat.GUI();
		
		var tvGui = gui.addFolder('Bad TV');
		tvGui.add(_tvShaderParams, 'show').onChange(onShaderToggled);
		tvGui.add(_tvShaderParams, 'distortion', 0.1, 20).step(0.1).listen().name("Thick Distort");
		tvGui.add(_tvShaderParams, 'distortion2', 0.1, 20).step(0.1).listen().name("Fine Distort");
		tvGui.add(_tvShaderParams, 'speed', 0.0,1.0).step(0.01).listen().name("Distort Speed");
		tvGui.add(_tvShaderParams, 'rollSpeed', 0.0,1.0).step(0.01).listen().name("Roll Speed");
		tvGui.open();
		
		var rgbGui = gui.addFolder('RGB Split');
		rgbGui.add(_rgbEffectParams, 'amount', 0.0, 1.0).step(0.001).listen().name("Amount");
		rgbGui.add(_rgbEffectParams, 'angle', 0.0, Math.PI * 2).step(0.01).listen().name("Angle");
		rgbGui.open();
		
		var scrollerGui = gui.addFolder('Scroller');
		scrollerGui.add(_scroller.params, 'debug')
		scrollerGui.add(_scroller.params, "showLogo");
		scrollerGui.add(_scroller.params, "scrollSpeed", 0.01, 20).listen().name("Scroll Speed");
		scrollerGui.add(_scroller.params, "wipeAlpha", 0.01, 1.0).step(0.01).listen().name("Wipe Alpha");
		scrollerGui.add(_scroller.params, "scanAngle", 0.01, Math.PI * 2).step(0.001).listen().name("Scan Angle");
		scrollerGui.add(_scroller.params, "scanHeight", 1, 100).listen().name("Scan Height");
		scrollerGui.add(_scroller.params, "brushAngle", 0.01, Math.PI * 2).step(0.001).listen().name("Brush Angle");
		scrollerGui.add(_scroller.params, "brushX", -window.innerWidth, window.innerWidth).listen().name("Brush X");
		scrollerGui.add(_scroller.params, "brushY", -window.innerHeight, window.innerHeight).listen().name("Brush Y");
		scrollerGui.add(_scroller.params, "brushScaleX", 0.0, 11.0).listen().name("Brush Scale X");
		scrollerGui.add(_scroller.params, "brushScaleY", 0.0, 11.0).listen().name("Brush Scale Y");
		scrollerGui.open();
	}
	
	function updateShadersFromGUI() {
		_tvShader.uniforms["distortion"].value = _tvShaderParams.distortion;
		_tvShader.uniforms["distortion2"].value = _tvShaderParams.distortion2;
		_tvShader.uniforms["speed"].value = _tvShaderParams.speed;
		_tvShader.uniforms["rollSpeed"].value = _tvShaderParams.rollSpeed;
		
		_rgbEffect.uniforms['amount'].value = _rgbEffectParams.amount;
		_rgbEffect.uniforms['angle'].value = _rgbEffectParams.angle;
	}
	
	function onShaderToggled() {
		
	}
});