// namespace
this.Golem = this.Golem || {};

(function(window, _, undefined) {
    var Widget, Collection, Data, Menu, Utility, ButtonBar;
    if (Golem.Util.checkExists('Golem.UI')) {
        
        /**
         * This object is a parent for all Widgets.  It also contains static
         * Definitions for those widgets
         * 
         * @constructor
         * @extends EventEmitter
         */
        Widget = function() {};
        Widget.prototype = Object.create(Golem.Util.EventEmitter);
        
        /**
         * Overwrite this method to deal with rendering
         */
        Widget.prototype.render = function() { };
        
        /**
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
            var list, oldItem, lastIndex, dimensions;
            
            lastIndex = this.lastIndex;
            list = this.list;
            if (_.isObject(index)) {
                dimensions = this.dimensions;
                index = ((index.row - 1) * dimensions[1]) + index.column - 1;
            }
            if (index <= lastIndex) {
                oldItem = list[index];
                list[index] = item;
                this.emit('add', {
                    item : item,
                    index : index,
                    replaced : oldItem
                });
                if (oldItem) {
                    this.emit('remove', {
                        index : index,
                        replaced : oldItem
                    });
                }
            } else {
                this.emit('outOfBounds', {
                    item : item,
                    attemptedIndex : index,
                    LastIndex : lastIndex
                });
            }
            return this;
        };
        
        
        /**
         * 
         * @constructor
         * @extends Collection
         */
        ButtonBar = function() {};
        ButtonBar.prototype = Object.create(Collection.prototype);
        
        /**
         * Assigning the collection definitions.
         */
        Collection.ButtonBar = ButtonBar;
        
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
         * Assigning the definitions to the parent object
         */
        Widget.Data = Data;
        Widget.Menu = Menu;
        Widget.Utility = Utility;
        Widget.Collection = Collection;
        
        /**
         * Expose Widgets to the Golem namespace.
         */
        Golem.UI.Widget = Widget;
    }
}(this, _));