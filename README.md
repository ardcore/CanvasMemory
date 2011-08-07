
CanvasMemory 
------------

wrapper around canvas 2d context adding methods to access
current transform matrix and drawing path.
Handful mostly in generative graphic, creative coding etc.

License: MIT.

API:

- applyTo(context) - applies memory context on top of canvas context 
- getCurrentCoords() - returns current drawing position with applied
  tranforms
- getCurrentOrigin() - returns position of 0, 0 with applied transforms
- getPointInCurrentMatrix(x, y) - returns position of x, y with applied
  transforms
- getTransform() - returns transform as array [m11, m12, m21, m22, x, y]
  (opposite of native setTransform())

Example:

    // init
    var canvas = document.querySelector('#test_canvas');
    var ctx = canvas.getContext('2d');
    var memctx = new CanvasMemory().applyTo(ctx);
    
    // some standard canvas drawing methods
    memctx.moveTo(10, 10);
    memctx.lineTo(20, 20);
    ...
    
    memctx.getCurrentCoords();
    memctx.getCurrentOrigin();
    memctx.getPointInCurrentMatrix(5, 5);
    memcts.getTransform();

See also example.html

TODO:

- support createLinearGradient & createRadianGradient
- check if some methods/props are missing
- test, test, test. jsperf benchmarks.

Note: As it basically delegates each operation while duplicating some of the matrix 
calculations in the background, it's probably quite expensive. You should use it only if you really need to.

 
