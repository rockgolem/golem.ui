/**
 * golem.ui v0.0.2 - 2013-01-03
 * UI widgets and event management for HTML5 games
 *
 * Copyright (c) 2013 Stephen Young <steve@rockgolem.com>
 * Licensed MIT
 */
// namespace
this.Golem = this.Golem || {};
(function(window, document, _, $, createjs, undefined) {
    "use strict";
    var Util, EventEmitter, logIfUndefined, separator = /\s+/;

    Util = {};
    Util.checkExists = function(dependencies, container, silent) {
        var value, exists;
        value = container || window;

        if (_.isArray(dependencies)) {
            _.each(dependencies, function(single) {
                _.each(single.split('.'), function(property) {
                    value = value[property];
                });

                exists = !_.isUndefined(value);
                logIfUndefined(single, exists, silent);

                // need to reset value for next iteration
                value = container || window;
                return exists;
            }, this);
        } else {
            _.each(dependencies.split('.'), function(property) {
                value = value[property];
            });

            exists = !_.isUndefined(value);
            logIfUndefined(dependencies, exists, silent);
        }
        return exists;
    };

    /**
     * EventEmitter can be mixed into any object's prototype.
     */
    EventEmitter = {};

    /**
     * Bind a listener
     * 
     * @param {String} events space separated list
     * @param {Function} callback
     * @param {Mixed} context context for the callback.
     * @returns {EventEmitter}
     */
    EventEmitter.on = function(events, callback, context) {
        var registry, list;
        if (_.isFunction(callback)) {
            events = events.split(separator);
            registry = this._eventRegistry || (this._eventRegistry = {});
            _.each(events, function(event) {
                list = (registry[event] || (registry[event] = []));
                list.push(callback, context);
            });
        }
        return this;
    };

    /**
     * Remove a listener
     * 
     * @param {String} events space separated list
     * @param {Function} callback
     * @param {Mixed} context
     * @returns {EventEmitter}
     */
    EventEmitter.off = function(events, callback, context) {
        var registry, list, i;
        registry = this._eventRegistry;
        if (registry) {
            if (events || callback || context) {
                events = events ? events.split(separator) : _.keys(registry);

                _.each(events, function(event) {
                    list = registry[event];
                    if (!list || !(callback || context)) {
                        delete registry[event];
                    } else {
                        for (i = list.length - 2; i >= 0; i -= 2) {
                            if (!(
                                callback && list[i] !== callback ||
                                context && list[i + 1] !== context
                            )) {
                                list.splice(i, 2);
                            }
                        }
                    }
                });
            } else {
                delete this._eventRegistry;
            }
        }
        return this;
    };
    
    /**
     * Trigger all bound callbacks for the specified events
     * 
     * @param {String} events space separated list
     * @returns {EventEmitter}
     */
    EventEmitter.emit = function(events) {
        var registry, list, i, length, args, all, rest;
        
        registry = this._eventRegistry;
        
        if (registry) {
            rest = [];
            events = events.split(separator);
            for (i = 1, length = arguments.length; i < length; i++) {
                rest[i - 1] = arguments[i];
            }
            
            _.each(events, function(event) {
                all = (registry.all || []).slice();
                list = (registry[event] || []).slice();
                if (list.length) {
                    for (i = 0, length = list.length; i < length; i += 2) {
                        list[i].apply(list[i + 1] || this, rest);
                    }
                }
                if (all.length) {
                    args = [event].concat(rest);
                    for (i = 0, length = all.length; i < length; i += 2) {
                        all[i].apply(all[i + 1] || this, args);
                    }
                }
            });
        }
        return this;
    };

    Util.EventEmitter = EventEmitter;

    /**
     * Wrapper for a common console.log message
     * 
     * @param {String} dependency
     * @param {Boolean} exists
     * @param {Boolean} silent
     * @returns {undefined}
     */
    logIfUndefined = function(dependency, exists, silent) {
        if (!silent && !exists) {
            console.log(dependency + ' is undefined.');
        }
    };

    _.extend(window.Golem, {Util: Util});
    var Preload;
    
    /**
     * PreloadJS Wrapper
     * 
     * @class Preload
     * @constructor
     * @param {Array} manifest { src : 'path/to/resource', id : 'Global.Object'}
     */
    Preload = function(manifest) {
        
        // check for missing dependencies
        Golem.Util.checkExists([
            'createjs.PreloadJS'
        ]);
    
        this.p = new createjs.PreloadJS();
        this.manifest = _.isUndefined(manifest) ? [] : manifest;
        this.head = document.getElementsByTagName('head')[0];
        this.body = document.body;
        this.loaded = false;
    };
    
    /**
     * Used to add assets to the manifest.  Pass in a single Object, or an
     * Array of objects.  If the initial manifest is already loaded or has
     * already started loading--or if a callback is provided--this method
     * will automatically load the asset.
     * 
     * Returns a boolean indicating if the manifest has already started loading.
     * 
     * @param {Mixed} manifest
     * @param {Function} callback
     * @return Boolean
     */
    Preload.prototype.addAsset = function(manifest, callback) {
        var loaded = this.loaded;
        
        if (_.isArray(manifest)) {
            this.manifest = this.manifest.concat(manifest);
        } else {
            this.manifest.push(manifest);
        }
    
        if(loaded || _.isFunction(callback)) {
            this.load(callback);
        }
        return loaded;
    };
    
    /**
     * Starts loading the manifest.
     * 
     * @param {Function} callback
     * @returns void
     */
    Preload.prototype.init = function(callback) {
        this.p.onFileLoad = _.bind(this.handleFile, this);
        this.load(callback);
    };

    /**
     * Loads whatever might be in the manifest, clears the manifest, and
     * executes the callback when everything is finished.
     * 
     * @param {function} callback
     * @returns {undefined}
     */
    Preload.prototype.load = function(callback) {
        var p = this.p;
        this.loaded = true;
        p.onComplete = this.getCallback(callback);
        p.loadManifest(this.manifest);
    };
    
    /**
     * Callback for handling loaded files.  Can normally be left alone.
     * Overwrite before calling Preload.init to use a custom handler.
     * 
     * @param event Object returned by PreloadJS
     * @returns void
     */
    Preload.prototype.handleFile = function(event) {
        var p = createjs.PreloadJS;
        
        switch (event.type) {
            case p.CSS : this.head.appendChild(event.result); break;
            case p.JAVASCRIPT : document.body.appendChild(event.result); break;
            case p.SOUND : this.body.appendChild(event.result); break;
            case p.IMAGE : break;
            case p.JSON : break;
            case p.XML : break;
        }
    };
    
    /**
     * Returns a wrapper function that will execute the callback only after the
     * Preloaded resource is available.
     * 
     * @param {function} callback
     */
    Preload.prototype.getCallback = function(callback) {
        var wrapped, p, manifest;
        
        p = this.p;
        manifest = this.manifest;
        callback = _.isFunction(callback) ? callback : function() {};
        
        wrapped = _.bind(function() {
            var loaded = _.all(manifest, function(file) {
                var parts, lib;
                if (_.last(file.src.split('.')) === 'js') {
                    parts = file.id.split('.');
                    lib = window;
                    _.each(parts, function(property) {
                        lib = lib[property];
                    });
                } else {
                    lib = true;
                }
                return !_.isUndefined(lib);
            });
        
            if (loaded) {
                this.manifest = [];
                callback();
            } else {
                setTimeout(wrapped, 1);
            }
        }, this);
        
        return wrapped;
    };

    _.extend(window.Golem, { Preload : Preload });
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
        this.resizeCanvas();
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
            viewportAspect, viewportRatio, stage;
        
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
        
        stage = this.stage;
        
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
            _.each(widget.children, function(childWidget) {
                childWidget.reposition(offsetx, offsety);
            });
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
    var Widget, Collection, Data, Menu, Utility, FillBar,
        ButtonBar, Button, ButtonScrim;

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
            console.log(this.spriteSheet);
        }
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
     * Expose Widgets to the Golem namespace.
     */
    Golem.UI.Widget = Widget;
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
            overflow.concat(items);
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
Data = function() {};
    Data.prototype = Object.create(Widget.prototype);
Menu = function() {};
    Menu.prototype = Object.create(Widget.prototype);
Utility = function() {};
    Utility.prototype = Object.create(Widget.prototype);
Button = function(spriteSheet, buttonList) {
        this.state = 'off';
        this.index = 0;
        this.spriteSheet = spriteSheet;
        this.buttonList = buttonList;
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
            this.emit(state, this);
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

        this.on('click', _.bind(this.onClick, this))
            .on('activeComplete', _.bind(this.setState, this, 'recharging'))
            .on('recharged', _.bind(this.setState, this, 'on'));

        $(active).addClass('active-pulse');
        $(el).addClass(Button.classes.join(' ')).append(scrim.el).append(active);

        this.el = el;
        this.displayObject = new createjs.DOMElement(el);
        this.scrim = scrim;
        this.setupEvents();
    };

    /**
     * Callback for click events
     * 
     * @param {Object} event
     * @returns {undefined}
     */
    Button.prototype.onClick = function(event) {
        switch(this.state) {
            case 'on':
                if (_.contains(_.pluck(this.buttonList, 'state'), 'active')) {
                    this.emit('waiting', this);
                } else {
                    this.setState('active');
                }
                break;
            case 'recharging':
                this.emit('waiting', this);
                break;
        }
    };

    /**
     * Proxies mouse and scrim events on the element to this object
     * 
     * @returns {undefined}
     */
    Button.prototype.setupEvents = function() {
        var callback, scrim, mouseEvents;

        callback = function(event) {
            this.emit(event.type, event);
        };
        scrim = this.scrim;
        mouseEvents = [
            'click', 'dblclick', 'mousedown', 'mouseup',
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave'
        ].join(' ');

        $(this.el).on(mouseEvents, _.bind(callback, this));


        _.each(['activeComplete', 'recharging', 'recharged'], function(type){
            scrim.on(type, _.bind(callback, this, { type : type }));
        }, this);
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
        if (this.queued) {
            classes.push('queued');
        }
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
ButtonScrim = function(options) {
        this.options = _.extend({
            size: 50,
            backgroundColor: '#000'
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
            width: pixels,
            height: pixels,
            lineHeight: pixels
        });

        clipValue1 = [0, widePixels, widePixels, halfWide.toString() + 'px'].join(' ');
        clipValue2 = [0, halfWide.toString() + 'px', widePixels, 0].join(' ');

        halfStyle = {
            width: widePixels,
            height: widePixels,
            backgroundColor: options.backgroundColor,
            clip: 'rect(' + clipValue1 + ')'
        };

        clipStyle = {
            width: widePixels,
            height: widePixels,
            top: offset,
            left: offset,
            clip: 'rect(' + clipValue1 + ')'
        };

        $(half1).addClass('half').css(halfStyle);

        halfStyle.clip = 'rect(' + clipValue2 + ')';
        $(half2).addClass('half').css(halfStyle);

        $(clip1).addClass('clip').css(clipStyle).append(half1);

        clipStyle.clip = 'rect(' + clipValue2 + ')';
        $(clip2).addClass('clip').css(clipStyle).append(half2);

        $(el).addClass('golem-scrim').css({
            width: pixels,
            height: pixels
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
        this.lastTick = (new Date()).getTime();
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
            now = (new Date()).getTime();
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
ButtonBar = function(options, stage) {
        Widget.call(this, stage);
        options = _.extend({
            classes : ['golem-container', 'golem-button-bar']
        }, options);
        this.parent = $(options.parent || 'body');
        this.buttons = [];
        this.queuedButton = null;

        this.setDimensions(options.rows || 1, options.columns || 4);
        this.setupSpriteSheet(options.spriteSheet);
        this.setupButtons(options.buttons);
        this.setWidthHeight();
        this.setupHTML(options);
        this.setupFillBar();
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
            stage, scrim, scrims, addChild, handleActive;
        stage = this.stage;
        list = this.list;
        addChild = stage.addChild;
        length = list.length;
        spriteSheet = this.spriteSheet;
        buttons = buttons || [];
        scrims = [];

        handleActive = _.bind(function(activeButton) {
            var activeScrim = activeButton.scrim;
            this.dumpQueue.apply(this, Array.prototype.slice(arguments, 0));
            if (activeScrim.activeTime > 0) {
                this.fillBar.setTargetValue(100, activeScrim.activeTime);
            }
        }, this);

        for(i = 0; i < length; i++) {
            if (_.isUndefined(list[i])) {

                b = new Button(spriteSheet, list);
                this.add(b, i);

                scrim = b.scrim;

                // register all display objects with the stage
                addChild.apply(stage, [b.displayObject].concat(scrim.displayObjects));

                // update buttons
                bOptions = buttons[i];
                if (bOptions) {
                    this.updateButton(i, bOptions);
                }
                scrims.push(scrim);

                // setup Queue events
                b.on('waiting', _.bind(this.updateQueue, this))
                    .on('activeComplete', _.bind(this.deQueue, this))
                    .on('recharged', _.bind(this.deQueueIfMatching, this, b))
                    .on('active', handleActive);
            }
        }
        // Listen to the Ticker to update scrims
        createjs.Ticker.addListener(_.bind(_.each, this, scrims, function(scrim) {
            scrim.tick();
        }));
    };

    ButtonBar.prototype.setupFillBar = function() {
        var fillBar, container;

        fillBar = Widget.buildWidget({
            type : 'FillBar',
            width : this.width / 2,
            targetValue : 0,
            x : this.optionX,
            y : this.optionY,
            offsetY : this.height + 20
        }, this.stage);

        container = fillBar.container;

        container.alpha = 0;
        this.fillBar = fillBar;
        this.stage.addChild(container);
        this.addChild(fillBar);
    };

    ButtonBar.prototype.updateQueue = function(button) {
        var alreadyQueued = this.queuedButton;
        if (!_.isNull(alreadyQueued)){
            alreadyQueued.queued = false;
            alreadyQueued.renderSprite();
        }
        this.queuedButton = button;
        button.queued = true;
        button.renderSprite();
    };

    ButtonBar.prototype.deQueue = function() {
        var button = this.queuedButton;
        if (!_.isNull(button)) {
            this.queuedButton = null;
            button.queued = false;
            button.emit('click');
            // no need to re-render, the click already does it
        }
    };

    ButtonBar.prototype.deQueueIfMatching = function(b) {
        var button = this.queuedButton;
        if (button === b) {
            this.queuedButton = null;
            b.queued = false;
            b.emit('click');
            // no need to re-render, the click already does it
        }
    };

    /**
     * Sometimes, you need to dump the queued button.
     *
     * @returns {undefined}
     */
    ButtonBar.prototype.dumpQueue = function(){
        var button;

        button = this.queuedButton;
        if (!_.isNull(button)) {
            this.queuedButton = null;
            button.queued = false;
            button.renderSprite();
        }
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
FillBar = function(options, stage) {
        Widget.call(this, stage);
        
        options = _.extend({
            x : 'middle',
            y : 'middle',
            width : 100,
            height : 20,
            max : 100,
            value : 0,
            targetValue : 100,
            duration : 2, // seconds
            borderColor : '#ccc',
            fillColor : 'rgb(245, 245, 220)'
        }, options);
    
        this.drawShapes(options);
        this.max = options.max;
        this.value = options.value;
        this.targetValue = options.targetValue;
        this.duration = options.duration * 1000;
        this.lastTick = (new Date()).getTime();
        createjs.Ticker.addListener(_.bind(this.tick, this));
    };
    FillBar.prototype = Object.create(Data.prototype);
    
    FillBar.prototype.reposition = function() {
        var container;
        container = this.container;
        container.x = this.getNormalizedX();
        container.y = this.getNormalizedY();
    };

    FillBar.prototype.drawShapes = function(options) {
        var container, border, fill;
        
        container = new createjs.Container();
        border = new createjs.Shape();
        this.optionX = options.x;
        this.optionY = options.y;
        this.offsetX = options.offsetX;
        this.offsetY = options.offsetY;
        this.width = options.width;
        this.height = options.height;
        this.fillColor = options.fillColor;
        this.borderColor = options.borderColor;
        this.height = options.height;
        border
            .graphics.beginFill(options.borderColor)
            .drawRoundRect(0, 0, options.width, options.height, 4);
        
        fill = new createjs.Shape();
        container.addChild(border);
        container.addChild(fill);
        this.container = container;
        this.fill = fill;
    };

    FillBar.prototype.drawFillPosition = function() {
        this.fill
            .graphics.clear().beginFill(this.fillColor)
            .drawRoundRect(
                2,
                2,
                ((this.width - 4) / this.max) * this.value,
                this.height - 4,
                2
            );
    };

    FillBar.prototype.render = function() {
        this.stage.addChild(this.container);
    };

    FillBar.prototype.tick = function() {
        var value, targetValue, now, elapsed, duration;
        
        value = this.value;
        targetValue = this.targetValue;
        duration = this.duration;
        now = (new Date()).getTime();
        elapsed = now - this.lastTick;
        
        if (value > targetValue) {
            this.value = Math.max(targetValue, value - ((elapsed / duration) * this.max));
            this.drawFillPosition();
        } else if (value < targetValue) {
            this.value = Math.min(targetValue, value + ((elapsed / duration) * this.max));
            this.drawFillPosition();
        }
        this.lastTick = now;
    };

    FillBar.prototype.setTargetValue = function(value, duration) {
        var container = this.container;
        this.lastTick = (new Date()).getTime();
        this.targetValue = value;
        if (value !== this.value) {
            this.duration = duration || 1000;
            createjs.Tween
                .get(container)
                .to({ alpha : 1 });
        }
    };
var definitions = {
        Collection : Collection,
            ButtonBar : ButtonBar,
        Data : Data,
            FillBar : FillBar,
        Menu : Menu,
        Utility : Utility
    };
}(this, document, _, jQuery, createjs));