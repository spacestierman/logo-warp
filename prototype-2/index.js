/* global totalElapsedMilliseconds */
$( document ).ready(function() {
	var _$experienceContainer = $('#homepage-experience');
	var _$experienceRenderContainer = _$experienceContainer.find('.homepage-experience-render');
	var _$experienceVideoContainer = _$experienceContainer.find('.homepage-experience-fallback');
	
	if (!canAttemptDynamicRender()) {
		_$experienceVideoContainer.removeClass('hidden');
	}
	else {
		var _logo = document.getElementById("logo");
		if (_logo == null)
		{
			throw "no logo";
		}
		var _undulating = new UndulatingLogo(_logo, 400, 150, "undulating");
		var _undulatingCanvas = _undulating.getCanvas(); 
	
		var _backgroundManager = new BackgroundManager(window.innerWidth, window.innerHeight);
		var _logoManager = new LogoManager();
		var _scrollerManager = new ScrollerManager(_backgroundManager.getDomElement(), _undulatingCanvas, _logoManager.getDomElement(), window.innerWidth, window.innerHeight);
		
		var _startedAt = new Date().getTime();
		var _lastRenderTicks = _startedAt;
		var _t = 0;
		
		var fpsContainer = document.getElementById('fpsContainer');
	    var _meter = new FPSMeter(fpsContainer);
		
		var _numberOfUnperformantFrames = 0;

		buildElementsToWindowWidthAndAddToDom();
		
		//document.body.appendChild(_scrollerManager.getScrollerCanvas());
		//document.body.appendChild(_scrollerWithEffects.getOutputCanvas());
		//document.body.appendChild(_backgroundManager.getDomElement());
		//document.body.appendChild(_scrollerCanvas);
		//document.body.appendChild(_undulatingCanvas);
		//document.body.appendChild(_logoManager.getDomElement());
		//document.body.appendChild(_logoManager.getLogoCanvas());
		
		setupDatGUI();
		render();
		listenForWindowResizing();
	}
	
	function canAttemptDynamicRender() {
		return Modernizr.webgl && Modernizr.canvas && Modernizr.canvastext && Modernizr.requestanimationframe && Modernizr.canvasblending;
	}
		
	function render() 
	{
		var nowTicks = new Date().getTime();
		var totalElapsedMilliseconds = _lastRenderTicks - _startedAt;
		var deltaMilliseconds = nowTicks - _lastRenderTicks;
		//console.log("totalElapsedMilliseconds: " + totalElapsedMilliseconds + "ms @" + _t + " dT:" + deltaMilliseconds + "ms");
		
		_undulating.render(totalElapsedMilliseconds);
		
		_backgroundManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		_logoManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		_scrollerManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		
		_lastRenderTicks = new Date().getTime();
		_t += 0.1;
		
		_meter.tick();
		
		requestAnotherRenderIfPerformanceIsGood(totalElapsedMilliseconds);
	}
	
	function requestAnotherRenderIfPerformanceIsGood(totalElapsedMilliseconds) {
		var doNextFrame = false;
		if (totalElapsedMilliseconds < 10000) { // While we're setting up, always request the next frame so that we can get a good sample size
			doNextFrame = true;
		}
		else {
			if (_meter.fps < 30.0) {
				_numberOfUnperformantFrames++;
				if (_numberOfUnperformantFrames > 50) {
					doNextFrame = false;
				}
			}
			else {
				_numberOfUnperformantFrames--;
				if (_numberOfUnperformantFrames < 0) {
					_numberOfUnperformantFrames = 0;
				}
			}
			doNextFrame = true;
		}
		
		if (doNextFrame) {
			requestAnimationFrame(render);
		}
	}
	
	function buildElementsToWindowWidthAndAddToDom() {
		_backgroundManager = new BackgroundManager(window.innerWidth, window.innerHeight);
		_scrollerManager = new ScrollerManager(_backgroundManager.getDomElement(), _undulatingCanvas, _logoManager.getDomElement(), window.innerWidth, window.innerHeight);
		
		_$experienceRenderContainer.empty();
		_$experienceRenderContainer.append(_scrollerManager.getDomElement());
	}
	
	function setupDatGUI() {
		_backgroundManager.showDatGUI();
		_logoManager.showDatGUI();
		_scrollerManager.showDatGUI();
	}
	
	function listenForWindowResizing() {
		$(window).resize(buildElementsToWindowWidthAndAddToDom);
	}
});