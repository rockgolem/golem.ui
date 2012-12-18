// namespace
this.Golem = this.Golem || {};

(function() {
        /**
         * FillBar is useful for things like experience Bars and progress bars.
         * 
         * @constructor
         * @extends Collection
         * @param {Object} options
         * @param {Stage} stage
         */
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
}());