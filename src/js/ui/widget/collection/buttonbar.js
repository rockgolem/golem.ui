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
            stage, scrim, scrims, addChild;
        stage = this.stage;
        list = this.list;
        addChild = stage.addChild;
        length = list.length;
        spriteSheet = this.spriteSheet;
        buttons = buttons || [];
        scrims = [];
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
                    .on('active', _.bind(function(activeButton) {
                        var activeScrim = activeButton.scrim;
                        this.dumpQueue.apply(this, Array.prototype.slice(arguments, 0));
                        if (activeScrim.activeTime > 0) {
                            this.fillBar.setTargetValue(100, activeScrim.activeTime);
                        } 
                    }, this));
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