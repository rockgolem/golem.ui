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