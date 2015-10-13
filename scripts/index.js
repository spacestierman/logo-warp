

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var fpsContainer = document.getElementById('fpsContainer');
var meter = new FPSMeter(fpsContainer);

var body = document.getElementById('body');
var W = 400;
var H = 150;
var DEBUG = true;

var _backgroundCanvas = document.createElement('canvas');
_backgroundCanvas.width = window.innerWidth;
_backgroundCanvas.height = window.innerHeight;
_backgroundCanvas.id = "background";
var _backgroundContext = _backgroundCanvas.getContext('2d');
_backgroundContext.globalCompositeOperation = "multiply";

var _foregroundCanvas = document.createElement('canvas');
_foregroundCanvas.width = _backgroundCanvas.width;
_foregroundCanvas.height = _backgroundCanvas.height;
_foregroundCanvas.id = "foreground";
var _foregroundContext = _foregroundCanvas.getContext('2d');

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

var _createOffsetCanvases = createOffsetCanvases('space150', W, H);

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
//body.appendChild(_temporaryCanvas);
body.appendChild(_foregroundCanvas);
body.appendChild(mainCanvas);

var _sliceCanvas = document.createElement('canvas');
_sliceCanvas.width = W;
_sliceCanvas.height = 1;
var _sliceContext = _sliceCanvas.getContext('2d');

var _distortionAngle = 0;

var _mainAngle = 0;
var _mainPosition = { 
    x: 175,
    y: 800
};

var mousePosition = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};
var mouseIsDown = false;
var _velocityVector = {
  x: 0.0,
  y: 1.0
};
$(_compositeCanvas).on('mousemove', function(event) {
  mousePosition.x = event.pageX;
  mousePosition.y = event.pageY;
});
$(_compositeCanvas).on('mousedown', function(event) {
  mouseIsDown = true;
});
$(_compositeCanvas).on('mouseup', function(event) {
  mouseIsDown = false;
});

render();

var _yOffset = 0;
var t = 0;
var DISPLACEMENT_MULTIPLIER = 20;
function render() {
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
  
  _foregroundContext.clearRect(0, 0, _foregroundCanvas.width, _foregroundCanvas.height);
  _foregroundContext.save();
  _foregroundContext.globalCompositeOperation = "source-over";
  _foregroundContext.translate(_mainPosition.x + W /2, _mainPosition.y + H / 2);
  _foregroundContext.rotate(_mainAngle);
  _foregroundContext.translate(-_mainPosition.x - W / 2, -_mainPosition.y - H / 2);
  _foregroundContext.drawImage(mainCanvas, _mainPosition.x , _mainPosition.y);
  _foregroundContext.restore();
 
  _temporaryContext.clearRect(0, 0, _temporaryCanvas.width, _temporaryCanvas.height);
  _temporaryContext.drawImage(_backgroundCanvas, 0, -_velocityVector.y); // Shift the background around
  
  _backgroundContext.clearRect(0, 0, _backgroundCanvas.width, _backgroundCanvas.height);
  _backgroundContext.drawImage(_temporaryCanvas, 0, 0);
  
  var points = getLinePoints(_distortionAngle, _mainPosition.x + W / 2, -_mainPosition.y);
  if (points.length > 0)
  {
    _backgroundContext.save();
    _backgroundContext.globalCompositeOperation = "multiply";
    _backgroundContext.drawImage(_foregroundCanvas, 0, 0);
    _backgroundContext.restore();
  
    var HEIGHT_OFFSET = 0.5; // This is how much of the vertical pixels we want to keep from the main asset.
    var left = points[0];
    var right = points[points.length - 1];
    
    _backgroundContext.save();
    _backgroundContext.globalCompositeOperation = "source-over";
    _backgroundContext.fillStyle = "rgba(255, 255, 255, 0.01)"; // The alpha here affects the "windshield wiper effect, controlling how much of the color stays on the screen.
    _backgroundContext.beginPath();
    _backgroundContext.moveTo(0, _backgroundCanvas.height);
    _backgroundContext.lineTo(0, left.y + HEIGHT_OFFSET);
    _backgroundContext.lineTo(_backgroundCanvas.width, right.y + HEIGHT_OFFSET);
    _backgroundContext.lineTo(_backgroundCanvas.width, _backgroundCanvas.height);
    _backgroundContext.lineTo(0, _backgroundCanvas.height);
    _backgroundContext.closePath();
    _backgroundContext.fill();
    _backgroundContext.restore();
  }
  
  
  _compositeContext.save();
  _compositeContext.globalCompositeOperation = "source-over";
  _compositeContext.clearRect(0, 0, _compositeCanvas.width, _compositeCanvas.height);
  _compositeContext.fillStyle = "white";
  _compositeContext.fillRect(0, 0, _compositeContext.width, _compositeContext.height);
  _compositeContext.drawImage(_backgroundCanvas, 0, 0);
  _compositeContext.drawImage(_foregroundCanvas, 0, 0);
  _compositeContext.restore();
  
  if (DEBUG)
  {
    _compositeContext.fillStyle = "red";
    
    var points = getLinePoints(_distortionAngle, _mainPosition.x + W / 2, -_mainPosition.y);
    if (points.length > 0) // Points can be empty for completely vertical lines that have infinite slope
    {
      for(i=0; i<points.length; i++)
      {
        var point = points[i];
        _compositeContext.fillRect(point.x, point.y, 1, 1);
      }
    }
  }
  t++;
  // _mainAngle = Math.sin(t / 100);
  _distortionAngle = -Math.cos(t / 10) / 2;
  
  var multiplier = mouseIsDown ? 5.0 : 1.0; 
  var normalizedX = (mousePosition.x / window.innerWidth);
  if (normalizedX < 0.33) {
    _mainAngle += (Math.PI / 256 * multiplier);
    _velocityVector.x = 5.0;
  }
  else if (normalizedX > 0.66) {
    _mainAngle -= (Math.PI / 256 * multiplier);
    _velocityVector.x = -5.0;
  }
  else {
    _velocityVector.x = 0.0;
  }
  
  var normalizedY = 800 + (mousePosition.y / window.innerHeight);
  _mainPosition.x += _velocityVector.x;
  if (_mainPosition.x < 0) {
    _mainPosition.x = 0;
  }
  else if (_mainPosition.x > window.innerWidth - W) {
    _mainPosition.x = window.innerWidth - W;
  }
  
  _mainPosition.y = Math.round(normalizedY);
  
  if (mouseIsDown) {
    _velocityVector.y = 3.0;
  }
  else {
    _velocityVector.y = 1.0;
  }
  
  meter.tick();
  
  requestAnimationFrame(render);
}

function normalizePointsToBoundingBox(points) {
  var axis = getBoundingAxis(points);
  var box = getBoundingBox(axis);
  var mapped = [];
  for(var i=0; i<points.length; i++) {
    var point = points[i];
    mapped.push({
      x: axis.minX + (axis.maxX - point.x),
      y: axis.minY + (axis.maxY - point.y)
    });
  }
  
  return {
    axis: axis,
    boundingBox: box,
    normalizedPoints: mapped
  };
}

function getBoundingBox(axis) {
  return {
    x: axis.minX,
    y: axis.minY,
    width: axis.maxX - axis.minX,
    height: axis.maxY - axis.minY
  };
}

function getBoundingAxis(points) {
  var minX = 0;
  var minY = 0;
  var maxX = 0;
  var maxY = 0;
  for (var i=0; i<points.length; i++)
  {
    var point = points[i];
    if (point.x < minX) {
      minX = point.x;
    }
    if (point.x > maxX) {
      maxX = point.x;
    }
    
    if (point.y < minY) {
      minY = point.y;
    }
    if (point.y > maxY) {
      maxY = point.y;
    }
  }
  
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
}

function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function getPixel(imageData, x, y, r, g, b, a) {
  var index = (x + y * imageData.width) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index+1],
    b: imageData.data[index+2],
    a: imageData.data[index+3]
  }
}

function getLinePoints(angle, xIntercept, yIntercept) {
  angle = angle % (Math.PI * 2);
  
  var vertical = Math.PI / 2;
  var verticalAlternate = Math.PI * 1.5;
  if (Math.abs(angle - vertical) <= 0.001 || Math.abs(angle - verticalAlternate) <= 0.001) {
    return [];
  }
  
  var slopeFormula = getSlopeFunction(angle, xIntercept, yIntercept);
  var points = [];
  for (var x=0; x < _backgroundCanvas.width; x++) {
    var y = Math.floor(slopeFormula(x)); // Flooring or ceiling or rounding these coordinates leaves artifacts.
    points.push({
      x: x, y: y
    });
  }
  return points;
}

function getSlopeFunction(angle, xIntercept, yIntercept) {
  return function(x) {
    var slope = Math.tan(angle);
    return slope * (x - xIntercept) - yIntercept;
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
