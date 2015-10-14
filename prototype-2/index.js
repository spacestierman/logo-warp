$( document ).ready(function() {
	var _scene = new THREE.Scene();
	var _camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	_camera.position.set(0,150,400);
	_camera.lookAt(_scene.position);	
	
	var _renderer = new THREE.WebGLRenderer();
	_renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild(_renderer.domElement);
	
	var _spriteTexture = THREE.ImageUtils.loadTexture('assets/images/redball.png');
	var _spriteMaterial = new THREE.SpriteMaterial({ map: _spriteTexture });
	var _sprite = new THREE.Sprite(_spriteMaterial);
	_sprite.position.set(50, 50, 0);
	_sprite.scale.set(100, 100, 1.0);
	_scene.add(_sprite);
	
	_composer = new THREE.EffectComposer(_renderer);
	_composer.addPass(new THREE.RenderPass(_scene, _camera));
	
	var _rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
	_rgbEffect.renderToScreen = true;
	_composer.addPass(_rgbEffect);
	
	var _bleachPass = new THREE.ShaderPass( THREE.BleachBypassShader );
	_bleachPass.uniforms["opacity"].value = 3.0;
	
	render();
	
	var _time = 0.0;
	var _timeStep = Math.PI / 256;
	function render() 
	{
		_rgbEffect.uniforms['amount'].value = Math.sin(_time) / 200;
		_rgbEffect.uniforms['angle'].value = Math.sin(_time);
		_rgbEffect.uniforms['tDiffuse'].value = Math.sin(_time) * 100;
		
		_composer.render();
		requestAnimationFrame(render);
		
		_time += _timeStep;
	}
});