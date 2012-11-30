// namespace
this.Golem = this.Golem || {};

(function(window, _, undefined) {
    var Widget, Collection, Data, Menu, Utility,
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
         * Called by the setDimensions method of the ButtonBar.
         * 
         * @param {Object} buttons
         * @returns {undefined}
         */
        ButtonBar.prototype.setupButtons = function(buttons) {
            var length, list, i, b, spriteSheet, bOptions,
                stage, scrim, scrims, displayObjects, addChild;
            stage = this.stage;
            list = this.list;
            addChild = stage.addChild;
            length = list.length;
            spriteSheet = this.spriteSheet;
            buttons = buttons || [];
            scrims = [];
            for(i = 0; i < length; i++) {
                if (_.isUndefined(list[i])) {
                    
                    b = new Button(spriteSheet);
                    this.add(b, i);
                    
                    scrim = b.scrim;
                    
                    // register with the stage
                    displayObjects = [b.displayObject].concat(scrim.displayObjects);
                    addChild.apply(stage, displayObjects);
                    
                    // update buttons
                    bOptions = buttons[i];
                    if (bOptions) {
                        this.updateButton(i, bOptions);
                    }
                    scrims.push(scrim);
                }
            }
            // Listen to the Ticker to update scrims
            createjs.Ticker.addListener(_.bind(_.each, this, scrims, function(scrim) {
                scrim.tick();
            }));
        };
    
        /**
         * Setup a button to use new data.
         * 
         * @param {Mixed} index
         * @param {Object} options
         * @returns {undefined}
         */
        ButtonBar.prototype.updateButton = function(index, options) {
            var b = this.get(index);
            
            // keep button defaults
            options = _.extend({
                index : b.index,
                activeTime : b.activeTime,
                rechargingTime : b.rechargingTime,
                state : b.state,
                activeTimeRemaining : b.activeTimeRemaining,
                rechargeTimeRemaining : b.rechargeTimeRemaining
            }, options);
            
            // update
            b.setIndex(options.index);
            b.setActiveTime(options.activeTime);
            b.setRechargingTime(options.rechargingTime);
            b.setState(options.state, options.activeTimeRemaining || options.rechargeTimeRemaining);
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
        Button.prototype.setState = function(state, remaining) {
            this.state = _.contains(Button.buttonStates, state) ? state : 'off';
            this.renderSprite();
            
            if (_.contains(['active', 'recharging'], state)) {
                this.setCountdown(state, remaining);
            }
        };
    
        /**
         * Sets the index of the sprite to render
         * 
         * @param {Number} index
         * @returns {undefined}
         */
        Button.prototype.setIndex = function(index) {
            this.index = index || 0;
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
            var el, active, scrim;
            
            el = document.createElement('div');
            active  = document.createElement('span');
            scrim = new ButtonScrim();
            
            this.on('click', _.bind(function(){
                if (this.state === 'on') {
                    this.setState('active');
                }
            }, this));
            scrim.on('activeComplete', _.bind(this.setState, this, 'recharging'));
            scrim.on('recharged', _.bind(this.setState, this, 'on'));
            
            $(active).addClass('active-pulse');
            $(el).addClass(Button.classes.join(' ')).append(active).append(scrim.el);
            
            this.el = el;
            this.displayObject = new createjs.DOMElement(el);
            this.scrim = scrim;
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
         * Proxy to the scrim setCountdown
         * 
         * @param {String} state
         * @param {Number} remaining
         * @returns {undefined}
         */
        Button.prototype.setCountdown = function(state, remaining) {
            this.scrim.setCountdown((state || this.state), remaining);
        };
    
        Button.prototype.setActiveTime = function(seconds) {
            this.scrim.setActiveTime(seconds || 0);
        };
    
        Button.prototype.setRechargingTime = function(seconds) {
            this.scrim.setRechargingTime(seconds || 0);
        };
        
        /**
         * This object tracks time and updates a rotating "clock" like effect on
         * buttons.
         * 
         * It assumes a square.
         * 
         * @constructor
         * @param {Object} options
         */
        ButtonScrim = function(options) {
            this.options = _.extend({
                size : 50,
                backgroundColor : '#000'
            }, options);
            this.buildElements();
            
            this.remaining = -1;
        };
        ButtonScrim.prototype = Object.create(Golem.Util.EventEmitter);
        
        /**
         * Sets up all the needed DOM elements
         * 
         * @param {undefined}
         * @returns {undefined}
         */
        ButtonScrim.prototype.buildElements = function() {
            var el, half1, half2, size, wide, clip1, clip2, clipValue1,
                clipValue2, pixels, clipStyle, widePixels, halfWide,
                offset, options, DOMElement, halfStyle, halfDOM1, halfDOM2,
                displayObjects, text;
            
            options = this.options;
            size = this.options.size;
            wide = Math.ceil((size * Math.sqrt(2)));
            halfWide = Math.round(wide / 2);
            
            pixels = size.toString() + 'px';
            widePixels = wide.toString() + 'px';
            offset = (-Math.round((wide - size) / 2)).toString() + "px";
            
            el = document.createElement('div');
            clip1 = document.createElement('div');
            clip2 = document.createElement('div');
            half1 = document.createElement('div');
            half2 = document.createElement('div');
            text = document.createElement('p');
            
            $(text).addClass('text').css({
                width : pixels,
                height: pixels,
                lineHeight : pixels
            });
            
            clipValue1 = [0, widePixels, widePixels, halfWide.toString() + 'px'].join(' ');
            clipValue2 = [0, halfWide.toString() + 'px', widePixels, 0].join(' ');
            
            halfStyle = {
                width : widePixels,
                height : widePixels,
                backgroundColor : options.backgroundColor,
                clip : 'rect(' + clipValue1 + ')'
            };
        
            clipStyle = {
                width : widePixels,
                height : widePixels,
                top : offset,
                left : offset,
                clip : 'rect(' + clipValue1 + ')'
            };
        
            $(half1).addClass('half').css(halfStyle);
            
            halfStyle.clip = 'rect(' + clipValue2 + ')';
            $(half2).addClass('half').css(halfStyle);
            
            $(clip1).addClass('clip').css(clipStyle).append(half1);
            
            clipStyle.clip = 'rect(' + clipValue2 + ')';
            $(clip2).addClass('clip').css(clipStyle).append(half2);
            
            $(el).addClass('golem-scrim').css({
                width : pixels,
                height : pixels
            }).append(clip1).append(clip2).append(text);
        
            this.el = el;
            this.text = text;
            
            DOMElement = createjs.DOMElement;
            halfDOM1 = new DOMElement(half1);
            halfDOM2 = new DOMElement(half2);
            
            displayObjects = [halfDOM1, halfDOM2];
            
            _.each(displayObjects, function(d) {
                d.regX = halfWide;
                d.regY = halfWide;
                d.x = halfWide;
                d.y = halfWide;
                d.rotation = 0;
            });
            
            this.displayObjects = displayObjects;
        };
        
        /**
         * Set the scrim rotation reveal state.
         * 
         * @param {Number} deg
         * @returns {undefined}
         */
        ButtonScrim.prototype.rotate = function(deg) {
            var displayObjects, halfway;
                    
            halfway = deg >= 180;
            displayObjects = this.displayObjects;
            displayObjects[0].rotation = halfway ? 180.001 : deg;
            displayObjects[1].rotation = halfway ? -(180.001 - deg) : 0;
        };
    
        ButtonScrim.prototype.setActiveTime = function(seconds) {
            this.activeTime = seconds * 1000;
        };
    
        ButtonScrim.prototype.setRechargingTime = function(seconds) {
            this.rechargingTime = seconds * 1000;
        };
    
        /**
         * Calling this method will set the scrim in motion.  Calling it
         * again will update it's position.  Seconds can be floating point
         * 
         * @param {String} state either 'active' or 'recharging'
         * @param {Number} remaining how many seconds are left
         * @returns {undefined}
         */
        ButtonScrim.prototype.setCountdown = function(state, remaining) {
            this.state = state;
            this.time = this[state + 'Time'];
            this.remaining = _.isNumber(remaining) ? remaining * 1000 : this.time;
            this.lastTick = (new Date).getTime();
        };
        
        /**
         * This method is called in a registerd method on the global Ticker by
         * the ButtonBar.  No need to call it yourself.
         * 
         * @returns {undefined}
         */
        ButtonScrim.prototype.tick = function() {
            var remaining, elapsed, now, deg;
            remaining = this.remaining;
            if (remaining > 0) {
                // get the elapsed time.
                now = (new Date).getTime();
                elapsed = now - this.lastTick;
                
                // update the remaining time
                remaining = Math.max(remaining - elapsed, 0);
                
                if (this.state === 'recharging') {
                    deg = 360 - ((remaining / this.time) * 360);
                    this.rotate(parseFloat(deg.toFixed(3)));
                    this.text.textContent = (remaining / 1000).toFixed(1);
                }
            
                // set the last tick for the next iteration
                this.lastTick = now;
                
                // set the remaining value
                this.remaining = remaining;
            } else if (parseInt(remaining, 10) === 0) {
                this.remaining = -1;
                this.emit(this.state === 'recharging' ? 'recharged' : 'activeComplete');
                
            }
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