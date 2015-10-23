/* global totalElapsedMilliseconds */
$( document ).ready(function() {
	var _logo = document.getElementById("logo");
	if (_logo == null)
	{
		throw "no logo";
	}
	var _undulating = new UndulatingLogo(_logo, 400, 150, "undulating");
	var _undulatingCanvas = _undulating.getCanvas(); 

	var _backgroundManager = new BackgroundManager();
	var _logoManager = new LogoManager();
	var _scrollerManager = new ScrollerManager(_backgroundManager.getDomElement(), _undulatingCanvas, _logoManager.getDomElement());
	
	var _startedAt = new Date().getTime();
	var _lastRenderTicks = _startedAt;
	var _t = 0;
	
	document.body.appendChild(_scrollerManager.getDomElement());
	//document.body.appendChild(_scrollerManager.getScrollerCanvas());
	//document.body.appendChild(_scrollerWithEffects.getOutputCanvas());
	//document.body.appendChild(_backgroundManager.getDomElement());
	//document.body.appendChild(_scrollerCanvas);
	//document.body.appendChild(_undulatingCanvas);
	//document.body.appendChild(_logoManager.getDomElement());
	//document.body.appendChild(_logoManager.getLogoCanvas());
	
	setupDatGUI();
	render();
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
		
		requestAnimationFrame(render);
	}
	
	function setupDatGUI() {
		_backgroundManager.showDatGUI();
		_logoManager.showDatGUI();
		_scrollerManager.showDatGUI();
	}
});