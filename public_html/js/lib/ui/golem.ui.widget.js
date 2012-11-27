// namespace
this.Golem = this.Golem || {};

(function(window, _, undefined) {
    var Widget, Collection, Data, Menu, Utility, ButtonBar, definitions;
    
    if (Golem.Util.checkExists('Golem.UI')) {
        
        /**
         * This object is a parent for all Widgets.  It also contains static
         * Definitions for those widgets
         * 
         * @constructor
         * @extends EventEmitter
         */
        Widget = function() { };
        Widget.prototype = Object.create(Golem.Util.EventEmitter);
        
        /**
         * Factory for building widgets
         * 
         * @param {Object} options
         * @returns {Widget}
         * @static
         */
        Widget.buildWidget = function(options) {
            var widget = new definitions[options.type]();
            return widget;
        };
    
        /**
         * Flags the widget as a DOM object type, and creates the element and
         * Easel class required.  Typically used internally.
         * 
         * @returns {createjs.DOMElement}
         */
        Widget.prototype.setupHTML = function() {
            var el = document.createElement('div');
            
            $(el).addClass('golem-widget');
            
            this.isHTML = true;
            this.displayObject = new createjs.DOMElement(el);
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
            
            // sequential list of all items in the collection
            this.list = [];
            
            // used for rare cases when items overflow the container.
            this.overflow = [];
            
        };
        Collection.prototype = Object.create(Widget.prototype);
        
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
            var list, oldItem, lastIndex, dimensions, i, length, event;
            
            lastIndex = this.lastIndex;
            list = this.list;
            if (_.isObject(index)) {
                dimensions = this.dimensions;
                index = ((index.row - 1) * dimensions[1]) + index.column - 1;
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
         * 
         * @constructor
         * @extends Collection
         */
        ButtonBar = function() {
            this.setupHTML();
            this.buttons = [];
        };
        ButtonBar.prototype = Object.create(Collection.prototype);
        
        ButtonBar.prototype.render = function() {
            
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