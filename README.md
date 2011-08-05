
CanvasMemory 
------------

wrapper around canvas 2d context adding 'getCoords' method.
Handful mostly in generative graphic, creative coding etc.

Usage:

    // init
    var canvas = document.querySelector('#test_canvas');
    var ctx = canvas.getContext('2d');
    var memctx = new CanvasMemory().applyTo(ctx);
    
    // some standard canvas drawing methods
    memctx.moveTo(10, 10);
    memctx.lineTo(20, 20);
    ...
    
    // and now, if you'd like to get current coordinates...
    memctx.getCoords();

See also example.html

TODO:

- support createLinearGradient & createRadianGradient
- test, test, test. jsperf benchmarks.

MIT license.
 
