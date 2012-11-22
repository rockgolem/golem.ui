// namespace
this.Golem = this.Golem || {};

(function(window, undefined) {
    var Widget, Collection, Data, Menu, Utility;
    if (Golem.Util.checkExists('Golem.UI')) {
        
        /**
         * This object is a parent for all Widgets.  It also contains static
         * Definitions for those widgets
         * 
         * @constructor
         */
        Widget = function() {
            
        };
        
        
        /**
         * 
         * @constructor
         * @extends Widget
         */
        Collection = function() {};
        Collection.prototype = Object.create(Widget.prototype);
        
        
        
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
}(this));