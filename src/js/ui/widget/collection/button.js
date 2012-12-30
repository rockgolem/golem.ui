    /**
     * Object used by ButtonBars to track button state.  Aware of other
     * buttons
     * 
     * @param {SpriteSheet} spriteSheet
     * @param {Array} buttonList
     * @returns {undefined}
     */
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