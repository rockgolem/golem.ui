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
        this.canvas = options.canvas || this.createCanvas();
        
        this.options = _.extend({}, options, { canvas : undefined });
        
        window.onresize = _.bind(this.resizeCanvas, this);
        this.resizeCanvas();
    };

    UI.prototype.createCanvas = function() {
        var c = document.createElement('canvas');
        return c;
    };

    UI.prototype.resizeCanvas = function() {
        var options, canvas, width, height, viewportWidth, viewportHeight;
        
        canvas = this.canvas;
        options = this.options;
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;

        width = viewportWidth * (options.widthRatio || 0.9);
        height = width / (options.aspectRatio || 8/6);
        
        _.extend(canvas.style, {
            position : 'fixed',
            left : (viewportWidth - width) / 2,
            top : (viewportHeight - height) / 2
        });
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        
        this.width = width;
        this.height = height;
        
    };
    _.extend(window.Golem, { UI : UI });
}(this, document, _));