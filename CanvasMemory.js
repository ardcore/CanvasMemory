/*
 * CanvasMemory - wrapper around canvas 2d context
 * adding methods to access current transform matrix
 * and drawing path.
 * 
 * Released under MIT license.
 *
 * Szymon Pilkowski <szymon.pilkowski@gmail.com>
 * http://twitter.com/ard
 */

(function(global) {

  function MatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]
  }

  function mulMatrix(m1, m2) {
    var res = new MatrixIdentity(),
        sum, x, y, z;

    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        sum = 0;
        for (z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }
        res[x][y] = sum;
      }
    }
    return res;
  }

  function isSane(matrix) {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 2; j++) {
        if (!isFinite(matrix[i][j]) || isNaN(matrix[i][j])) {
          return false;
        }
      }
    }
    return true;
  }

  function storeMatrix(context, matrix) {
    if (isSane(matrix)) {
      context._storedMatrix = matrix;
    } 
  }

  // helper function - copies style-related properties of canvas
  // TODO switch to setters?
  function copyProps(base, target) {
    var propList = [
      'lineWidth'     , 'lineJoin'      , 'lineCap'     ,
      'fillStyle'     , 'strokeStyle'   , 'globalAlpha' ,
      'miterLimit'    , 'shadowBlur'    , 'shadowColor' ,
      'shadowOffsetX' , 'shadowOffsetY' , 'drawImage'
      ]
    for (var i = 0; i < propList.length; i++) {
      target[propList[i]] = base[propList[i]];
    }
  }

  function CanvasMemory() {
    this.canvas = null;
    this.coords = {x:0, y:0};
    this._storedMatrix = new MatrixIdentity();
    this._stack = [];
    this._matrixStack = [];
  }

  // public method, applies wrapper to canvas context
  CanvasMemory.prototype.applyTo = function(target) {
    var canvasMethods = [
      'beginPath'            , 'closePath'        , 'moveTo'               ,
      'translate'            , 'rect'             , 'strokeRect'           ,
      'fillRect'             , 'arc'              , 'lineTo'               ,
      'bezierCurveTo'        , 'quadraticCurveTo' , 'stroke'               ,
      'createLinearGradient' , 'scale'            , 'rotate'               ,
      'transform'            , 'setTransform'     , 'fill'                 ,
      'save'                 , 'restore'          , 'createRadialGradient' ,
      'createLinearGradient'
      // anything missing?
      
    ]
    this.canvas = target;
    copyProps(target, this);
    for (var i = 0; i < canvasMethods.length; i++) {
      this[canvasMethods[i]] = function() {};
      (function(i, ref){
        ref[canvasMethods[i]] = function() {
          if (ref[canvasMethods[i]]._pre) {
            ref[canvasMethods[i]]._pre.apply(ref, arguments);
          }
          ref.canvas[canvasMethods[i]].apply(ref.canvas, arguments);
          if (ref[canvasMethods[i]]._post) {
            ref[canvasMethods[i]]._post.apply(ref, arguments);
          }
        }
      })(i, this)
    }
    this._proxyMethods();
    return target;
  }
  
  // public method - returns current coordinates in the drawing path
  CanvasMemory.prototype.getCurrentCoords = function() {
    return this.coords;
  }

  // public method - returns position of x, y in current transform matrix
  CanvasMemory.prototype.getPointInCurrentMatrix = function(x, y) {
    return this._getCoords(x, y);
  }

  // public method - sugar - returns position of 0, 0 in current transform
  // matrix
  CanvasMemory.prototype.getCurrentOrigin = function() {
   return this.getPointInCurrentMatrix(0, 0); 
  }

  CanvasMemory.prototype._prefixMethod = function(target, methodName, fn) {
    target[methodName]._pre = fn;
  }

  CanvasMemory.prototype._suffixMethod = function(target, methodName, fn) {
    target[methodName]._post =fn;
  }

  CanvasMemory.prototype._proxyMethods = function() {

    function proxySetCoords(x, y) {
      var pos = this._getCoords(x, y);
      this._setCoords(pos);
    }

    function proxySetCoordsLast() {
      var a = Array.prototype.slice.call(arguments, -2);   
      var pos = this._getCoords(a[0], a[1]);
      this._setCoords(pos);
    }

    function proxyCopyProps() {
      copyProps(this, this.canvas);
    }

    function proxySave() {
      var state = {};
      copyProps(this, state);
      this._stack.push(state);
      this._matrixStack.push(this._storedMatrix);
      this._storedMatrix = mulMatrix(new MatrixIdentity(), this._storedMatrix); 
    }

    function proxyRestore() {
      var lastState = this._stack.pop();
      copyProps(lastState, this);
      this._storedMatrix = this._matrixStack.pop();
    }

    function proxyTranslate(x, y) {
      var matrix = [
        [1, 0, 0],
        [0, 1, 0],
        [x, y, 1]
      ];

      var matrixTransformed = mulMatrix(matrix, this._storedMatrix);
      storeMatrix(this, matrixTransformed);
    }

    function proxyRotate(angle) {
      var c = Math.cos(angle),
          s = Math.sin(angle);

      var matrix = [
        [c , s, 0],
        [-s, c, 0],
        [0 , 0, 1]
      ]

      var matrixTransformed = mulMatrix(matrix, this._storedMatrix);
      storeMatrix(this, matrixTransformed);
    }

    function proxyScale(x, y) {
      var matrix = [
        [x, 0, 0],
        [0, y, 0],
        [0, 0, 1]
      ]

      var matrixTransformed = mulMatrix(matrix, this._storedMatrix);
      storeMatrix(this, matrixTransformed);
    }

    function proxyTransform(m11, m12, m21, m22, x, y) {
      var m = [
        [m11, m12, 0],
        [m21, m22, 0],
        [x,   y  , 1]
      ]

      var matrixTransformed = mulMatrix(matrix, this._storedMatrix);
      storeMatrix(this, matrixTransformed);
    }

    function proxySetTransform(m11, m12, m21, m22, x, y) {
      var matrix = [
        [m11, m12, 0],
        [m21, m22, 0],
        [x,   y  , 1]
      ]

      storeMatrix(this, matrix);
    }
    
    // TODO add gradient-related methods, check if something else is missing

    
    // drawing methods must be prefixed with fn that applies styles
    this._prefixMethod(this, 'rect', proxyCopyProps);
    this._prefixMethod(this, 'arc', proxyCopyProps);
    this._prefixMethod(this, 'stroke', proxyCopyProps);
    this._prefixMethod(this, 'fill', proxyCopyProps);
    this._prefixMethod(this, 'strokeRect', proxyCopyProps);
    this._prefixMethod(this, 'fillRect', proxyCopyProps);

    // methods that modify coords must be suffixed with fn that stores coords
    this._suffixMethod(this, 'lineTo', proxySetCoords);
    this._suffixMethod(this, 'moveTo', proxySetCoords);
    this._suffixMethod(this, 'rect', proxySetCoords);
    this._suffixMethod(this, 'strokeRect', proxySetCoords);
    this._suffixMethod(this, 'fillRect', proxySetCoords);
    // curves are special - x, y parameters are passed at the end
    this._suffixMethod(this, 'bezierCurveTo', proxySetCoordsLast);
    this._suffixMethod(this, 'quadraticCurveTo', proxySetCoordsLast);

    // more complex matrix operations
    this._suffixMethod(this, 'save', proxySave);
    this._suffixMethod(this, 'restore', proxyRestore);
    this._suffixMethod(this, 'translate', proxyTranslate);
    this._suffixMethod(this, 'scale', proxyScale);
    this._suffixMethod(this, 'rotate', proxyRotate);
    this._suffixMethod(this, 'transform', proxyTransform);
    this._suffixMethod(this, 'setTransform', proxySetTransform);

  }

  CanvasMemory.prototype._getCoords = function(x, y) {
    var m = this._storedMatrix;
    var s = {
      x: x * m[0][0] + y * m[1][0] + m[2][0],
      y: x * m[0][1] + y * m[1][1] + m[2][1]
    }
    return s;
  }

  CanvasMemory.prototype._setCoords = function(coords) {
    this.coords.x = coords.x;
    this.coords.y = coords.y;
  }

  CanvasMemory.prototype._updateCoords = function() {
    var pos = this._getCoords(this.coords.x, this.coords.y);
    this._setCoords(pos);
  }

  CanvasMemory.prototype._setX = function(val) {
    this.coords.x = val;
  }

  CanvasMemory.prototype._setY = function(val) {
    this.coords.y = val;
  }

  global.CanvasMemory = CanvasMemory;

})(this);
