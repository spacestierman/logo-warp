$( document ).ready(function() {
	var _$experienceContainer = $('#homepage-experience');
	var _$preloadContainer = $(".homepage-experience-preload");
	var _$experienceRenderContainer = _$experienceContainer.find('.homepage-experience-render');
	var _$fallbackContainer = _$experienceContainer.find('.homepage-experience-fallback');
	
	var _fpsHistory = new FpsHistory(32);
	var _interactionState = new InteractionState();
	
	if (!canAttemptDynamicRender()) {
		showVideo();
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
		var _currentFrame = 0;
		var _t = 0;
		
		var fpsContainer = document.getElementById('fpsContainer');
	    var _meter = new FPSMeter(fpsContainer);
		_meter.hide();
		
		var _lastSwitchTick = 0;
		var _datGuiIsSetup = false;
		var _konamiMode = false;
		var _hasHadPerformantFramerate = false;
		
		buildElementsToWindowWidthAndAddToDom();
		render();
		listenForWindowResizing();
		listenForKonamiCode();
	}
	
	function showVideo() {
		_lastSwitchTick = new Date().getTime();
		
		_$preloadContainer.addClass('hidden');
		_$experienceRenderContainer.addClass('hidden');
		_$fallbackContainer.removeClass('hidden');
	}
	
	function showRender()
	{
		_lastSwitchTick = new Date().getTime();
		
		_$preloadContainer.addClass('hidden');
		_$fallbackContainer.addClass('hidden');
			
		_$experienceRenderContainer.removeClass('hidden');
		_$experienceRenderContainer.show({
			duration: 1000,
			easing: "linear"	
		});
		
		_$experienceRenderContainer.on('mousedown', onUserMouseDown);
		_$experienceRenderContainer.on('mouseup', onUserMouseUp);
		$(document).on('keydown', onUserKeyDown);
		$(document).on('keyup', onUserKeyUp);
	}
	
	function isShowingRender() {
		return !_$experienceRenderContainer.hasClass('hidden');
	}
	
	function canAttemptDynamicRender() {
		return Modernizr.webgl && Modernizr.canvas && Modernizr.canvastext && Modernizr.requestanimationframe && Modernizr.canvasblending;
	}
		
	function render() 
	{
		_meter.tickStart();
		
		var nowTicks = new Date().getTime();
		var totalElapsedMilliseconds = _lastRenderTicks - _startedAt;
		var deltaMilliseconds = nowTicks - _lastRenderTicks;
		
		_undulating.render(totalElapsedMilliseconds);
		
		_backgroundManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		_logoManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		_scrollerManager.render(totalElapsedMilliseconds, deltaMilliseconds);
		
		_lastRenderTicks = new Date().getTime();
		_t += 0.1;
		_currentFrame += 1;
		
		var continueAnimating = true;
		if (!_hasHadPerformantFramerate) // Once we've had a performant chunk of frames, we're going to believe that all subsequent frames can be good.
		{
			var numberOfSamples = _fpsHistory.getNumberOfSamples();
			if (numberOfSamples > 10) { // Our worst-case scenarios have a duration of about 250ms per frame.  We need to keep the number of frames in the preload check low so that the experience doesn't take forever to load.
				var averageDurationInMilliseconds = _fpsHistory.getAverageDurationForLastFrames(numberOfSamples - 2); // Ignore the first couple startup frames
				var sixtyFpsDuration = _fpsHistory.calculateDurationInMillisecondsForFps(60);
				var thirtyFpsDuration = _fpsHistory.calculateDurationInMillisecondsForFps(30);
				var twentyFourFpsDuration = _fpsHistory.calculateDurationInMillisecondsForFps(24);
				if (averageDurationInMilliseconds <= sixtyFpsDuration || averageDurationInMilliseconds <= thirtyFpsDuration) {
					_hasHadPerformantFramerate = true;
					showRender();
				}
				else if (averageDurationInMilliseconds <= twentyFourFpsDuration)
				{ /* Continue tracking, but don't stop checking */ }
				else { // If the average duration sucks, then we don't need to track anything further.  It will never improve.
					continueAnimating = false;
				}
			}
		}
		
		_meter.tick();
		_fpsHistory.log(_meter.duration, _meter.fps);
		
		if (continueAnimating) {
			requestAnimationFrame(render);
		}
	}
	
	function buildElementsToWindowWidthAndAddToDom() {
		_datGuiIsSetup = false; // When we rebuild the elements, we need to reset dat GUI
		
		_backgroundManager = new BackgroundManager(window.innerWidth, window.innerHeight);
		_scrollerManager = new ScrollerManager(_backgroundManager.getDomElement(), _undulatingCanvas, _logoManager.getDomElement(), window.innerWidth, window.innerHeight, _interactionState);
		
		var outputCanvas = _scrollerManager.getDomElement();
		var $outputCanvas = $(outputCanvas);
		
		_$experienceRenderContainer.empty();
		_$experienceRenderContainer.append(_scrollerManager.getDomElement());
		
		//document.body.appendChild(_scrollerManager.getScrollerCanvas());
		//document.body.appendChild(_scrollerWithEffects.getOutputCanvas());
		//document.body.appendChild(_backgroundManager.getDomElement());
		//document.body.appendChild(_scrollerCanvas);
		//document.body.appendChild(_undulatingCanvas);
		//document.body.appendChild(_logoManager.getDomElement());
		//document.body.appendChild(_logoManager.getLogoCanvas());
	}
	
	function setupDatGUI() {
		_backgroundManager.showDatGUI();
		_logoManager.showDatGUI();
		_scrollerManager.showDatGUI();
		
		_datGuiIsSetup = true;
	}
	
	function listenForWindowResizing() {
		$(window).resize(onWindowResize);
	}
	
	function onWindowResize() {
		buildElementsToWindowWidthAndAddToDom();
	}
	
	function listenForKonamiCode() {
		$(window).konami();
		$(window).on('konami', onKonamiCodeEntered);
	}
	
	function onKonamiCodeEntered() {
		_konamiMode = !_konamiMode;
		
		if (_konamiMode) {
			_meter.show();
		}
		else {
			_meter.hide();
		}
		
		if (!_datGuiIsSetup) {
			setupDatGUI();
		}
		else {
			dat.GUI.toggleHide();
		}
	}
	
	function onUserMouseDown(evt) {
		_interactionState.setMouseDownState(true);
	}
	
	function onUserMouseUp(evt) {
		_interactionState.setMouseDownState(false);
	}
	
	function onUserKeyDown(evt) {
		console.log(evt.keyCode);
		_interactionState.setKeyState(evt.keyCode, true);
	}
	
	function onUserKeyUp(evt) {
		_interactionState.setKeyState(evt.keyCode, false);
	}
});