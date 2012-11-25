// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var UI, tick;
    
    /**
     * Golem.UI
     * 
     * Pass in a canvas element, or UI wil make one for you.
     * 
     * @constructor
     * @param {Object} options
     */
    UI = function(options) {
        
        this.widgets = [];
        
        options = options || {};
        this.canvas = options.canvas || UI.createCanvas();
        this.options = _.extend({}, options, { canvas : undefined });
        this.prepareCanvas();
        this.loadStage();
        this.startTicker();
    };

    /**
     * Used to add a new widget object to the UI stack
     * 
     * @param {type} widgetOptions
     * @returns {undefined}
     */
    UI.prototype.addWidget = function(widgetOptions) {
        
    };

    /**
     * Prepares the EaselJS Stage.  Can be passed in.
     * 
     * @param {Stage} stage
     */
    UI.prototype.loadStage = function(stage) {
        var canvas = this.canvas;
        if (canvas) {
            stage = stage || this.options.stage || new createjs.Stage(canvas);
        }
        this.stage = stage;
    };

    /**
     * Some preparation styling and event binding.  Called by the constructor.
     * 
     * @returns {undefined}
     */
    UI.prototype.prepareCanvas = function() {
        $(this.canvas).addClass('golem-stage');
        window.onresize = _.bind(this.resizeCanvas, this);
        this.resizeCanvas();
    };
    
    /**
     * This method is bound to the window resize event automatically.
     * 
     * @returns {undefined}
     */
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
     * Private method called on the Ticker to update the UI.
     */
    tick = function(elapsed, isPaused) {
        this.stage.update();
    };
    
    /**
     * 
     * @returns {undefined}
     */
    UI.prototype.startTicker = function() {
        var Ticker = createjs.Ticker;
        Ticker.useRAF = true;
        Ticker.setFPS(60);
        Ticker.addListener(_.bind(tick, this));
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