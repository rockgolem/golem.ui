// namespace
this.Golem = this.Golem || {};

(function(window, _, undefined) {
    var Widget, Collection, Data, Menu, Utility, FillBar,
        ButtonBar, Button, ButtonScrim, definitions;
    
    if (Golem.Util.checkExists('Golem.UI')) {
        
        /**
         * This object is a parent for all Widgets.  It also contains static
         * Definitions for those widgets.
         * 
         * 
         * Make sure to use `Widget.call(this, stage);` in all child
         * constructors.
         * 
         * 
         * @constructor
         * @extends EventEmitter
         * @param {Stage} stage
         */
        Widget = function(stage) {
            this.stage = stage;
        };
        Widget.prototype = Object.create(Golem.Util.EventEmitter);
        
        /**
         * Factory for building widgets
         * 
         * @param {Object} options
         * @param {Stage} stage
         * @returns {Widget}
         * @static
         */
        Widget.buildWidget = function(options, stage) {
            var widget = new definitions[options.type](options, stage);
            return widget;
        };
        
        Widget.prototype.children = [];
        
        Widget.prototype.addChild = function(widget){
            this.children.push(widget);
        };
        
        /**
         * Returns the normalized X position
         * 
         * @returns {Number}
         */
        Widget.prototype.getNormalizedX = function() {
            return Widget.getNormalizedPositionValue(
                this.optionX,
                this.width,
                $(this.stage.canvas).width(),
                this.offsetX
            );
        };
        
        /**
         * Returns the normalized Y position
         * 
         * @returns {Number}
         */
        Widget.prototype.getNormalizedY = function() {
            return Widget.getNormalizedPositionValue(
                this.optionY,
                this.height,
                $(this.stage.canvas).height(),
                this.offsetY
            );
        };
        
        /**
         * 
         * @param {Mixed} position
         * @param {Number} originalPosition
         * @param {Number} stagePosition
         * @param {Number} offset
         * @returns {parseInt}
         * @static
         */
        Widget.getNormalizedPositionValue = function(position, originalPosition, stagePosition, offset) {
            if (_.isString(position)) {
                offset = offset || 0;
                switch(position) {
                    case 'top':
                    case 'left':
                        position = offset;
                        break;
                    case 'middle':
                        position = ((stagePosition - originalPosition) / 2) + offset;
                        break;
                    case 'right':
                    case 'bottom':
                        position = stagePosition - originalPosition - offset;
                        break;
                }
            }
            return parseInt(position, 10);
        };
    
        /**
         * Placeholder render method for all widgets.
         * @returns {undefined}
         */
        Widget.prototype.render = function() { };
    
        /**
         * Flags the widget as a DOM object type, and creates the element and
         * Easel class required.  Typically used internally.
         * 
         * @param {Object} options
         * @returns {createjs.DOMElement}
         */
        Widget.prototype.setupHTML = function(options) {
            var el, displayObject, classes, x, y;
            
            classes = ['golem-widget'].concat(options.classes);
            if (options.className) {
                classes.push(options.className);
            }
            
            el = document.createElement('div');
           
            this.optionX = options.x;
            this.optionY = options.y;
            this.offsetX = options.offsetX;
            this.offsetY = options.offsetY;
            x = this.getNormalizedX();
            y = this.getNormalizedY();
            displayObject = new createjs.DOMElement(el);
            displayObject.x = x;
            displayObject.x = y;
            
            this.x = x;
            this.y = y;
            this.isHTML = true;
            this.el = el;
            this.displayObject = displayObject;
            
            // update the HTML
             $(this.el)
                .css({ height : this.height, width : this.width })
                .addClass(classes.join(' '));
        };
        
        /**
         * Some widgets need a spritesheet.  This creates it.
         * 
         * @param {type} options
         * @returns {undefined}
         */
        Widget.prototype.setupSpriteSheet = function(options) {
            if (!_.isUndefined(options)) {
                this.spriteSheet = new createjs.SpriteSheet(options);
            };
        };
    
        Widget.prototype.setWidthHeight = function() {
            var spriteSheet, dimensions, width, height;
            spriteSheet = this.spriteSheet;
            dimensions = this.dimensions;
            width = spriteSheet._frameWidth * dimensions[1];
            height = spriteSheet._frameHeight * dimensions[0];
            
            this.width = width;
            this.height = height;
        };

        /**
        * Container holding private constructor definitions for the Widget
        * factory.
        * 
        * @type {Object}
        */
        definitions = {
            Collection : Collection,
                ButtonBar : ButtonBar,
            Data : Data,
                FillBar : FillBar,
            Menu : Menu,
            Utility : Utility
        };
        
        /**
         * Expose Widgets to the Golem namespace.
         */
        Golem.UI.Widget = Widget;
    }
}(this, _));