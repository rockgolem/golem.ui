// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var Util;
    
    
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
                Util.logIfUndefined(single, exists, silent);
                
                // need to reset value for next iteration
                value = container || window;
                return exists;
            }, this);
        } else {
            _.each(dependencies.split('.'), function(property) {
                value = value[property];
            });
            
            exists = !_.isUndefined(value);
            Util.logIfUndefined(dependencies, exists, silent);
        }
        return exists;
    };
    
    /**
     * Wrapper for a common console.log message
     * 
     * @param {String} dependency
     * @param {Boolean} exists
     * @returns {undefined}
     */
    Util.logIfUndefined = function(dependency, exists, silent) {
        if (!silent && !exists) {
            console.log(dependency + ' is undefined.');
        }
    };

    _.extend(window.Golem, { Util : Util });
}(this, document, _));