// namespace
this.Golem = this.Golem || {};

(function(window, _, undefined) {
    var Widget, Collection, Data, Menu, Utility, ButtonBar, Button, definitions;
    
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
            var el, $el, displayObject, classes, x, y;
            
            classes = ['golem-widget'].concat(options.classes);
            if (options.className) {
                classes.push(options.className);
            }
            
            el = document.createElement('div');
            $el = $(el);
            $el.addClass(classes.join(' '));
           
            this.optionX = options.x;
            this.optionY = options.y;
            this.offsetX = options.offsetX;
            this.offsetY = options.offsetY;
            x = this.getNormalizedX();
            y = this.getNormalizedY();
            displayObject = new createjs.DOMElement(el);
            displayObject.x = x;
            displayObject.x = y;
            this.setVisibility(false);
            
            this.x = x;
            this.y = y;
            this.isHTML = true;
            this.el = el;
            this.displayObject = displayObject;
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
        
        /**
         * Sets the visibility if a displayObject has been defined
         * 
         * @param {Boolean} visible
         * @returns {undefined}
         */
        Widget.prototype.setVisibility = function(visible) {
            var displayObject = this.displayObject;
            if (displayObject) {
                displayObject.visible = !!visible;
            }
        };
    
        Widget.prototype.setWidthHeight = function() {
            var spriteSheet, dimensions, width, height;
            spriteSheet = this.spriteSheet;
            dimensions = this.dimensions;
            width = spriteSheet._frameWidth * dimensions[1];
            height = spriteSheet._frameHeight * dimensions[0];
            
            $(this.el).css({ height : height, width : width });
        
            this.width = width;
            this.height = height;
        };

        /**
         * Collection is a base class for button containers, inventory
         * containers, and menu docks (not to be confused with the Menu class).
         * 
         * @constructor
         * @extends Widget
         */
        Collection = function() {
            this.setDimensions(1, 4);
        };
        Collection.prototype = Object.create(Widget.prototype);
        
        // sequential list of all items in the collection
        Collection.prototype.list = [];
            
        // used for rare cases when items overflow the container.
        Collection.prototype.overflow = [];
        
        /**
         * Sets the boundaries for this collection.  If the collection has
         * anything currently in the list, they will be reset to the beginning
         * of the list, i.e. indexes will not be maintained.
         * 
         * If resizing the collection causes it to be too small to hold all of
         * it's items, they will be pushed onto the overflow buffer.
         * 
         * @param {Number} rows
         * @param {Number} columns
         * @returns Collection
         */
        Collection.prototype.setDimensions = function(rows, columns) {
            var newList, lastIndex;
            
            lastIndex = this.lastIndex = (rows * columns) - 1;
            newList = _.compact(this.list);
            this.dimensions = [rows, columns];
            
            if (newList.length > lastIndex) {
                this.addToOverflow(newList.splice(lastIndex));
            } else {
                newList.length = lastIndex + 1;
            }
            this.list = newList;
            return this;
        };
        
        /**
         * Pushes items onto the overflow buffer and emits an overflow event
         * 
         * @param {Mixed} items
         * @returns {undefined}
         */
        Collection.prototype.addToOverflow = function(items) {
            var overflow = this.overflow;
            
            if (_.isArray(items)) {
                overflow + items;
            } else {
                overflow.push(items);
            }
            this.emit('overflow', items, overflow);
        };
        
        /**
         * Used to add things to the collection.
         * 
         * Index should be zero based.
         * 
         * If index is an object, the row and column keys should *not* be zero
         * based, for example:
         * 
         * row 1 [column 1, column 2]
         * row 2 [column 1, column 2]
         * row 3 [column 1, column 2]
         * 
         * @param {Mixed} item anything you want to store in the collection
         * @param {Mixed} index a numeric index, or an object { row : #, column : # }
         * @returns Collection
         */
        Collection.prototype.add = function(item, index) {
            var list, oldItem, lastIndex, i, length, event;
            
            lastIndex = this.lastIndex;
            list = this.list;
            if (_.isObject(index)) {
                index = this.getPosition(index);
            } else if (_.isUndefined(index)) {
                index = -1;
                length = list.length;
                for (i = 0; i <= length; ++i) {
                    if (_.isUndefined(list[i])) {
                        index = i;
                        break;
                    }
                }
            }
        
            event = {
                item : item,
                index : index,
                lastIndex : lastIndex
            };
            if (index <= lastIndex) {
                oldItem = list[index];
                list[index] = item;
                _.extend(event, { type : 'add', replaced : oldItem });
            } else {
                _.extend(event, { type : 'outOfBounds' });
            }
            
            this.emit(event.type, event);
            return this;
        };
    
        /**
         * Used to retrieve the item in either a zero based index, or a 1 based
         * row/column coordinate
         * 
         * @param {Mixed} index numeric index or { row : #, column : # }
         * @returns {undefined}
         */
        Collection.prototype.get = function(index) {
            var item;
            if (_.isObject(index)) {
                index = this.getPosition(index);
            }
            item = this.list[index];
            return item;
        };
        
        /**
         * Get the row / column based on an index value, or vice versa
         * 
         * @param {Mixed} index
         * @returns {Object}
         */
        Collection.prototype.getPosition = function(index) {
            var columns, rows, row, value;
            
            columns = this.dimensions[1];
            if (_.isObject(index)) {
                value = ((index.row - 1) * columns) + index.column - 1;
            } else {
                rows = this.dimensions[0];
                row = Math.floor(index / columns) + 1;
                value = {
                    row : row,
                    column : (index - ((row - 1) * columns)) + 1
                };
            }
            return value;
        };
        
        /**
         * ButtonBar is useful for things like skill buttons.
         * 
         * @constructor
         * @extends Collection
         * @param {Object} options
         * @param {Stage} stage
         */
        ButtonBar = function(options, stage) {
            Widget.call(this, stage);
            options = _.extend({
                classes : ['golem-container', 'golem-button-bar']
            }, options);
            this.parent = $(options.parent || 'body');
            this.buttons = [];
            
            this.setDimensions(options.rows || 1, options.columns || 4);
            this.setupSpriteSheet(options.spriteSheet);
            this.setWidthHeight();
            this.setupHTML(options);
            
        };
        ButtonBar.prototype = Object.create(Collection.prototype);
        
        /**
         * ButtonBars always have a button object in every space.  This button
         * object keeps track of state, like "empty" or not
         * 
         * @param {Number} rows
         * @param {Number} columns
         * @returns {undefined}
         */
        ButtonBar.prototype.setDimensions = function(rows, columns) {
            Collection.prototype.setDimensions.call(this, rows, columns);
            this.setupButtons();
        };
        
        /**
         * Typically called by the setDimensions method of the ButtonBar
         * 
         * @returns {undefined}
         */
        ButtonBar.prototype.setupButtons = function() {
            var length, list, i, b;
            list = this.list;
            length = list.length;
            for(i = 0; i < length; i++) {
                if (_.isUndefined(list[i])) {
                    b = new Button();
                    this.add(b, i);
                }
            }
        };
        
        /**
         * Appends the container DOM element to the parent.
         * 
         * @returns {undefined}
         */
        ButtonBar.prototype.render = function() {
            var $el, spriteSheet;
            
            $el = $(this.el);
            spriteSheet = this.spriteSheet;
            
            _.each(this.list, function(button, index) {
                button.render(spriteSheet, index, this.getPosition(index));
                $el.append(button.el);
            }, this);
            
            this.parent.append($el);
            this.setVisibility(true);
        };
        
        /**
         * Used by screen resizing to make sure this widget moves with the
         * canvas.
         * 
         * @param {type} offsetx
         * @param {type} offsety
         * @returns {undefined}
         */
        ButtonBar.prototype.reposition = function(offsetx, offsety) {
            var displayObject = this.displayObject;
            displayObject.x = this.getNormalizedX() + offsetx;
            displayObject.y = this.getNormalizedY() + offsety;
        };
    
        /**
         * Object used by ButtonBars to track button state
         * 
         * @returns {undefined}
         */
        Button = function() {
            this.setup();
        };
        Button.prototype = Object.create(Golem.Util.EventEmitter);
        
        /**
         * Styles the button graphic.  This is called by the ButtonBar render
         * method, no need to call it yourself.
         * 
         * @param {SpriteSheet} spriteSheet
         * @param {Number} index
         * @param {Object} position
         * @returns {undefined}
         */
        Button.prototype.render = function(spriteSheet, index, position) {
            var data, img, rect, width, height;
            
            data = spriteSheet._frames[index];
            img = data.image;
            rect = data.rect;
            width = rect.width;
            height = rect.height;
            console.log(position);
            $(this.el).css({
                width : width.toString() + 'px',
                height : height.toString() + 'px',
                top : (position.row - 1) * height,
                left : (position.column - 1) * width,
                background : [
                    "url('" + img.src + "')",
                    (-rect.x).toString() + 'px',
                    (-rect.y).toString() + 'px',
                    'no-repeat',
                    'transparent'
                ].join(' ')
            });
        };
        
        Button.prototype.setup = function() {
            var el = document.createElement('div');
            
            $(el).addClass('golem-button');
            
            this.el = el;
            this.displayObject = new createjs.DOMElement(el);
        };
        
        /**
         * 
         * @constructor
         * @extends Widget
         */
        Data = function() {};
        Data.prototype = Object.create(Widget.prototype);
        
        /**
         * 
         * @constructor
         * @extends Widget
         */
        Menu = function() {};
        Menu.prototype = Object.create(Widget.prototype);
        
        /**
         * 
         * @constructor
         * @extends Widget
         */
        Utility = function() {};
        Utility.prototype = Object.create(Widget.prototype);

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
            Menu : Menu,
            Utility : Utility
        };
        
        /**
         * Expose Widgets to the Golem namespace.
         */
        Golem.UI.Widget = Widget;
    }
}(this, _));