
CanvasMemory 
------------

wrapper around canvas 2d context adding methods which can be used to access
current transform matrix and drawing path.
Handful mostly in generative graphic, creative coding etc.

License: MIT.

API:
- applyTo(context) - applies memory context on top of canvas context 
- getCurrentCoords() - returns current drawing position with applied
  tranforms
- getCurrentOrigin() - return position of 0, 0 with applied transforms
- getPointInCurrentMatrix(x, y) - returns position of x, y with applied
  transforms

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

See also example.html

TODO:

- support createLinearGradient & createRadianGradient
- check if some methods/props are missing
- test, test, test. jsperf benchmarks.

 
