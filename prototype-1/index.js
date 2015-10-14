var body = document.getElementById('body');

var _undulating = new UndulatingLogo("space150", 400, 150, "undulating");
var _scroller = new Scroller(window.innerWidth, window.innerHeight, _undulating.getCanvas());
body.appendChild(_scroller.getCanvas());

var _startedAt = new Date().getTime();
var _lastRenderTicks = _startedAt;

render();
function render() {
  var nowTicks = new Date().getTime();
	var totalElapsedMilliseconds = _startedAt - _lastRenderTicks;
  
  _undulating.render(totalElapsedMilliseconds);
  _scroller.render();
  
  _lastRenderTicks = new Date().getTime();
  
  requestAnimationFrame(render);
}