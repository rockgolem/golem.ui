// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var UI;
    
    /**
     * Golem.UI
     * 
     * Pass in a canvas element, or UI wil make one for you.
     * 
     * @constructor
     * @param {Object} options
     */
    UI = function(options) {
        options = options || {};
        this.canvas = options.canvas || UI.createCanvas();
        
        this.options = _.extend({}, options, { canvas : undefined });
        
        window.onresize = _.bind(this.resizeCanvas, this);
        this.resizeCanvas();
    };

    UI.prototype.resizeCanvas = function() {
        var options, canvas, width, height, aspectRatio, viewportWidth,
            viewportHeight, viewportAspect, viewportRatio;
        
        canvas = this.canvas;
        options = this.options;
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        viewportAspect = viewportWidth / viewportHeight;
        viewportRatio = options.viewportRatio || 0.98;
        aspectRatio = options.aspectRatio || 8/6;
        
        if (viewportAspect <= aspectRatio) {
            width  = viewportWidth * viewportRatio;
            height = width / aspectRatio;
        } else {
            height = viewportHeight * viewportRatio;
            width  = height * aspectRatio;
        }
        
        _.extend(canvas.style, {
            position : 'fixed',
            left : ((viewportWidth - width) / 2).toFixed(0) + 'px',
            top : ((viewportHeight - height) / 2).toFixed(0) + 'px'
        });
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        
        this.width = width;
        this.height = height;
        
    };
    
    /**
     * Creates a canvas element and returns it
     * 
     * @return DOMElement
     */
    UI.createCanvas = function() {
        var c = document.createElement('canvas');
        return c;
    };

    _.extend(window.Golem, { UI : UI });
}(this, document, _));