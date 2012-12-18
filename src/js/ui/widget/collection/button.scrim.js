// namespace
this.Golem = this.Golem || {};

(function() {
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

}());