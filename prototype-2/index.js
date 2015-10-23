/* global totalElapsedMilliseconds */
$( document ).ready(function() {
	var _logo = document.getElementById("logo");
	if (_logo == null)
	{
		throw "no logo";
	}
	var _undulating = new UndulatingLogo(_logo, 400, 150, "undulating");
	var _undulatingCanvas = _undulating.getCanvas(); 

	var _fuzz = document.getElementById("fuzz");
	var _background = new Background(window.innerWidth, window.innerHeight, _fuzz, ["don't fear oblivion", "the bold are never obsolete", "the future is already yours", "creation is your lifeblood", "innovation pulses through your veins", "Metamorphosis is your second nature"]);
	var _backgroundWithEffects = new EffectsRenderer(_background.getDomElement());
	
	var _logoMain = new Logo(document.getElementById("logo-large")) 
	var _logoMainWithEffects = new EffectsRenderer(_logoMain.getDomElement());
	_logoMainWithEffects.addPass(new THREE.ShaderPass(THREE.BadTVShader));
	
	var _scrollerManager = new ScrollerManager(_background.getDomElement(), _undulatingCanvas);
	
	var _startedAt = new Date().getTime();
	var _lastRenderTicks = _startedAt;
	var _t = 0;
	
	document.body.appendChild(_scrollerManager.getDomElement());
	//document.body.appendChild(_scrollerWithEffects.getOutputCanvas());
	//document.body.appendChild(_background.getDomElement());
	//document.body.appendChild(_backgroundWithEffects.getOutputCanvas());
	//document.body.appendChild(_scrollerCanvas);
	//document.body.appendChild(_undulatingCanvas);
	document.body.appendChild(_logoMainWithEffects.getOutputCanvas());
	
	setupDatGUI();
	render();
	function render() 
	{
		var nowTicks = new Date().getTime();
		var totalElapsedMilliseconds = _lastRenderTicks - _startedAt;
		var deltaMilliseconds = nowTicks - _lastRenderTicks;
		//console.log("totalElapsedMilliseconds: " + totalElapsedMilliseconds + "ms @" + _t + " dT:" + deltaMilliseconds + "ms");
		
		_background.render(totalElapsedMilliseconds);
		_undulating.render(totalElapsedMilliseconds);
		
		_logoMain.render(totalElapsedMilliseconds);
		_logoMainWithEffects.render(totalElapsedMilliseconds);
		
		_scrollerManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		
		_backgroundWithEffects.render(totalElapsedMilliseconds);
		
		_lastRenderTicks = new Date().getTime();
		_t += 0.1;
		
		requestAnimationFrame(render);
	}
	
	function setupDatGUI() {
		buildBackgroundGUI();
		_scrollerManager.showDatGUI();
	}
	
	function buildBackgroundGUI() {
		var gui = new dat.GUI();
		
		var backgroundFolder = gui.addFolder("Background");
		backgroundFolder.add(_background.getParameters(), "fontSizeInPixels", 1, 30).name("Font Size");
		backgroundFolder.add(_background.getParameters(), "fontAlpha", 0.01, 1.0).name("Font Alpha");
		backgroundFolder.add(_background.getParameters(), "stepHeightInPixels", 1, 100).name("Step Height");
		//backgroundFolder.open();
	}
});