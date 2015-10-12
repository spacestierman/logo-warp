

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var fpsContainer = document.getElementById('fpsContainer');
var meter = new FPSMeter(fpsContainer);

var body = document.getElementById('body');
var W = 400;
var H = 150;

var _backgroundCanvas = document.createElement('canvas');
_backgroundCanvas.width = window.innerWidth;
_backgroundCanvas.height = window.innerHeight;
_backgroundCanvas.id = "background";
var _backgroundContext = _backgroundCanvas.getContext('2d');
_backgroundContext.globalCompositeOperation = 'multiply';

var _compositeCanvas = document.createElement('canvas');
_compositeCanvas.width = _backgroundCanvas.width;
_compositeCanvas.height = _backgroundCanvas.height;
_compositeCanvas.id = "composite";
var _compositeContext = _compositeCanvas.getContext('2d');

var _temporaryCanvas = document.createElement('canvas');
_temporaryCanvas.width = _backgroundCanvas.width;
_temporaryCanvas.height = _backgroundCanvas.height;
_temporaryCanvas.id = "temporary";
var _temporaryContext = _temporaryCanvas.getContext('2d');

var _createOffsetCanvases = createOffsetCanvases('spacesss', W, H);

var _createOffsetCanvases2 = _slicedToArray(_createOffsetCanvases, 3);

var r = _createOffsetCanvases2[0];
var g = _createOffsetCanvases2[1];
var b = _createOffsetCanvases2[2];

var mainCanvas = document.createElement('canvas');
mainCanvas.height = H;
mainCanvas.width = W;
mainCanvas.id = "main";

var ctx = mainCanvas.getContext('2d');
ctx.globalCompositeOperation = 'multiply';


body.appendChild(_compositeCanvas);
body.appendChild(_backgroundCanvas);
body.appendChild(mainCanvas);

var _sliceCanvas = document.createElement('canvas');
_sliceCanvas.width = W;
_sliceCanvas.height = 1;
var _sliceContext = _sliceCanvas.getContext('2d');

var _mainAngle = 0;
var _mainPosition = { 
    x: 100,
    y: 1000
};

var _yOffset = 0;
var t = 0;
var DISPLACEMENT_MULTIPLIER = 20;
function render() {
  var start = Date.now();
  
  ctx.clearRect(0, 0, W, H);
  for (var y = 0; y < H; y += 1) {
    var angle = -Math.sin((t + y) / 10) / 10;
    var offset = Math.cos(t / 10);
    var displaceStrength = angle * DISPLACEMENT_MULTIPLIER;
    
    createSliceCanvas(W, angle, r, y);
    ctx.drawImage(_sliceCanvas, offset + displaceStrength, y);
    
    createSliceCanvas(W, angle, g, y);
    ctx.drawImage(_sliceCanvas, offset, y);
    
    createSliceCanvas(W, angle, b, y);
    ctx.drawImage(_sliceCanvas, offset - displaceStrength, y);
  }
  
  var imageData = _backgroundContext.createImageData(W, 1);
  for (var x=0; x < W; x++) {
    var pixel = ctx.getImageData(x, 0, 1, 1);
    var pR = pixel.data[0];
    var pG = pixel.data[1];
    var pB = pixel.data[2];
    var pA = pixel.data[3];
    setPixel(imageData, x, 0, pR, pG, pB, pA);
  }
  
  _temporaryContext.clearRect(0, 0, _temporaryCanvas.width, _temporaryCanvas.height);
  var offsetX = 0; //Math.sin(t / 100);
  var offsetY = -1; //Math.cos(t / 100) - 2;
  _temporaryContext.drawImage(_backgroundCanvas, offsetX, offsetY);
  
  _backgroundContext.clearRect(0, 0, _backgroundCanvas.width, _backgroundCanvas.height);
  _backgroundContext.drawImage(_temporaryCanvas, 0, 0);
  _backgroundContext.putImageData(imageData, _mainPosition.x, _mainPosition.y + _yOffset);
  
  
  _compositeContext.clearRect(0, 0, _backgroundCanvas.width, _backgroundCanvas.height);
  _compositeContext.drawImage(_backgroundCanvas, 0, 0);
  
  _compositeContext.save();
  _compositeContext.translate(_mainPosition.x + W /2, _mainPosition.y + H / 2);
  _compositeContext.rotate(_mainAngle);
  _compositeContext.translate(-_mainPosition.x - W / 2, -_mainPosition.y - H / 2);
  _compositeContext.drawImage(mainCanvas, _mainPosition.x , _mainPosition.y);
  _compositeContext.restore();
  
  t++;
  _mainAngle += (Math.PI / 512);
  /*_mainPosition = {
    x: Math.floor(200 + Math.cos(_mainAngle) * 100),
    y: _mainPosition.y //Math.floor(500 + Math.sin(_mainAngle) * 100)
  };*/
  
  meter.tick();
  
  requestAnimationFrame(render);
  
  var finish = Date.now();
  var duration = finish - start;
  var fps = Math.floor(1000 / duration);
  console.log("duration: " + duration + "ms (" + fps + "fps) @(" + _mainPosition.x + ", " + _mainPosition.y + ")");
}
render();

function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function getLinePixels(angle) {
  var slopeFormula = getSlopeFunction(angle);
  var points = [];
  for (var x=0; x < W; x++) {
    var y = slopeFormula(x);
    points.push({
      x: x, y: y
    });
  }
  return points;
}

function getSlopeFunction(angle) {
  return function(x) {
    var slope = Math.tan(angle);
    return slope * x;
  }
}

function createSliceCanvas(w, angle, image, y) {
  _sliceContext.save();
  _sliceContext.clearRect(0, 0, _sliceCanvas.width, _sliceCanvas.height);
  _sliceContext.translate(-w/2, -y/2);
  _sliceContext.rotate(angle);
  _sliceContext.translate(w/2, y/2);
  _sliceContext.drawImage(image, 0, -y);
  _sliceContext.restore();
}

function createOffsetCanvases(text, w, h) {
  var r = document.createElement('canvas');
  r.height = h;
  r.width = w;
  r.getContext('2d').font = '80px sans-serif';
    
  var g = document.createElement('canvas');
  g.height = h;
  g.width = w;
  g.getContext('2d').font = '80px sans-serif';
    
  var b = document.createElement('canvas');
  b.height = h;
  b.width = w;
  b.getContext('2d').font = '80px sans-serif';
    
  var all = [r, g, b];
  var rCtx = r.getContext('2d');
  var gCtx = g.getContext('2d');
  var bCtx = b.getContext('2d');
  rCtx.fillStyle = 'red';
  gCtx.fillStyle = 'green';
  bCtx.fillStyle = 'blue';

  var textWidth = 400;

  var textHeight = textWidth / text.length;
  var textX = w / 2 - textWidth / 2;
  var textY = h / 2 - textHeight / 2;
  rCtx.fillText(text, textX, textY);
  gCtx.fillText(text, textX, textY);
  bCtx.fillText(text, textX, textY);
  return all;
}