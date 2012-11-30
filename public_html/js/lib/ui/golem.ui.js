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
        this.setupTicker(options);
    };

    /**
     * Used to add a new widget object to the UI stack.  Typically you should
     * pass in a hash of params and this will pass those params to a widget
     * factory.  But, if you already have a constructed widget, you can pass
     * that instead.
     * 
     * @param {Mixed} obj Hash of options or a Widget
     * @returns {Widget}
     */
    UI.prototype.addWidget = function(obj) {
        var W = UI.Widget, wid, stage = this.stage;
        wid = obj instanceof W ? obj : W.buildWidget(obj, stage);
        this.widgets.push(wid);
        
        stage.addChild(wid.displayObject);
        return wid;
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
     * Renders the canvas, registers the tick method (call this last in the
     * client script)
     * 
     * @returns {undefined}
     */
    UI.prototype.render = function() {
        this.startTicker();
        this.renderWidgets();
    };

    /**
     * Loops through all widgets, rendering them to the interface.
     * 
     * @returns {undefined}
     */
    UI.prototype.renderWidgets = function() {
        this.repositionWidgets();
        _.each(this.widgets, function(widget) {
            widget.render();
        });
    };
    
    /**
     * This method is bound to the window resize event automatically.
     * 
     * @returns {undefined}
     */
    UI.prototype.resizeCanvas = function() {
        var options, canvas, width, height, left, top,
            aspectRatio, viewportWidth, viewportHeight,
            viewportAspect, viewportRatio;
        
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
        
        left = ((viewportWidth - width) / 2).toFixed(0);
        top = ((viewportHeight - height) / 2).toFixed(0);
        
        _.extend(canvas.style, {
            position : 'fixed',
            left : left + 'px',
            top  : top + 'px'
        });
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        
        this.left = parseInt(left, 10);
        this.top = parseInt(top, 10);
        this.width = width;
        this.height = height;
        
        this.repositionWidgets();
    };

    /**
     * Since the stage is dynamic, the widgets need to move, too.
     * @returns {undefined}
     */
    UI.prototype.repositionWidgets = function() {
        var offsetx, offsety;
        
        offsetx = this.left;
        offsety = this.top;
        
        _.each(this.widgets, function(widget) {
            widget.reposition(offsetx, offsety);
        });
    };
    
    /**
     * Private method called on the Ticker to update the UI.
     */
    tick = function(elapsed, isPaused) {
        this.stage.update();
    };
    
    /**
     * Binds the ticker listener
     * 
     * @returns {undefined}
     */
    UI.prototype.startTicker = function() {
        createjs.Ticker.addListener(_.bind(tick, this));
    };

    /**
     * Sets ticker options
     * 
     * @param {Object} options
     * @returns {undefined}
     */
    UI.prototype.setupTicker = function(options) {
        var Ticker = createjs.Ticker;
        
        options = _.extend({}, options);
        Ticker.useRAF = options.useRAF || true;
        Ticker.setFPS(options.FPS || 60);
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