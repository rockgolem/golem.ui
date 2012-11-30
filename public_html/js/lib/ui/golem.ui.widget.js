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
            this.setupButtons(options.buttons);
            this.setWidthHeight();
            this.setupHTML(options);
        };
        ButtonBar.prototype = Object.create(Collection.prototype);
        
        /**
         * Called by the setDimensions method of the ButtonBar
         * buttons param is an array of objects
         * 
         * @param {Object} buttons
         * @returns {undefined}
         */
        ButtonBar.prototype.setupButtons = function(buttons) {
            var length, list, i, b, spriteSheet, bOptions, stage;
            stage = this.stage;
            list = this.list;
            length = list.length;
            spriteSheet = this.spriteSheet;
            buttons = buttons || [];
            for(i = 0; i < length; i++) {
                if (_.isUndefined(list[i])) {
                    b = new Button(spriteSheet);
                    this.add(b, i);
                    stage.addChild(b.displayObject);
                    bOptions = buttons[i];
                    if (bOptions) {
                        b.setState(bOptions.state);
                        b.setIndex(bOptions.index);
                    }
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
                button.render(this.getPosition(index));
                $el.append(button.el);
            }, this);
            
            this.parent.append($el);
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
         * @param {SpriteSheet} spriteSheet
         * @returns {undefined}
         */
        Button = function(spriteSheet) {
            this.state = 'off';
            this.index = 0;
            this.spriteSheet = spriteSheet;
            this.setup();
        };
        Button.prototype = Object.create(Golem.Util.EventEmitter);
        
        /**
         * @static
         * @type {Array}
         */
        Button.buttonStates = [
            'on',           // button is ready to be clicked
            'off',          // button shows an empty state
            'disabled',     // button is shown, but cannot click
            'mousedown',    // button is being clicked
            'active',       // button has been clicked 
            'recharging'    // button is on a timer
        ];
    
        Button.classes = ['golem-button'];
    
        /**
         * Updates the state of the button to a valid state
         * 
         * @param {string} state
         * @returns {undefined}
         */
        Button.prototype.setState = function(state) {
            this.state = _.contains(Button.buttonStates, state) ? state : 'off';
        };
    
        /**
         * Sets the index of the sprite to render
         * 
         * @param {Number} index
         * @returns {undefined}
         */
        Button.prototype.setIndex = function(index) {
            this.index = index;
        };
        
        /**
         * Styles the button graphic.  This is called by the ButtonBar render
         * method, no need to call it yourself.
         * 
         * @param {Object} position
         * @returns {undefined}
         */
        Button.prototype.render = function(position) {
            var rect, width, height;
            
            rect = this.getSpriteData().rect;
            width = rect.width;
            height = rect.height;
            $(this.el).css({
                width : width.toString() + 'px',
                height : height.toString() + 'px',
                top : (position.row - 1) * height,
                left : (position.column - 1) * width
            });
            this.renderSprite();
        };
        
        /**
         * Some initialization code
         * 
         * @returns {undefined}
         */
        Button.prototype.setup = function() {
            var el, active;
            
            el = document.createElement('div');
            active  = document.createElement('span');
            
            $(active).addClass('active-pulse');
            $(el).addClass(Button.classes.join(' ')).append(active);
            
            this.el = el;
            this.displayObject = new createjs.DOMElement(el);
            this.setupMouseEvents();
        };
    
        /**
         * Proxies mouse events on the element to this object
         * 
         * @returns {undefined}
         */
        Button.prototype.setupMouseEvents = function() {
            $(this.el).on('click dblclick mousedown mouseup mouseover mouseout mouseenter mouseleave', _.bind(function(event) {
                this.emit(event.type, event);
            }, this));
        };
    
        /**
         * Returns the sprite data for the button's current index
         * 
         * @return {Object}
         */
        Button.prototype.getSpriteData = function() {
            return this.spriteSheet._frames[this.index];
        };
        
        /**
         * Updates the Button Sprite's visual state
         * 
         * @returns {undefined}
         */
        Button.prototype.renderSprite = function() {
            var state, displayObject, classes;
            
            state = this.state;
            displayObject = this.displayObject;
            this.setBackgroundSprite(state !== 'off');
            
            classes = Button.classes.slice();
            classes.push('golem-button-' + state);
            $(this.el).removeClass().addClass(classes.join(' '));
        };
        
        /**
         * Used to render the background image
         * 
         * @param {Boolean} display
         * @returns {undefined}
         */
        Button.prototype.setBackgroundSprite = function(display) {
            var data, img, rect, options;
            if (display) {
                data =  this.getSpriteData();
                img = data.image;
                rect = data.rect;

                options = {
                    background : [
                        "url('" + img.src + "')",
                        (-rect.x).toString() + 'px',
                        (-rect.y).toString() + 'px',
                        'no-repeat',
                        'transparent'
                    ].join(' ')
                };
            } else {
                options = { background : 'none' };
            }
            $(this.el).css(options);
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