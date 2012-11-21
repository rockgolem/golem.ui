// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var Util = {};
    
    Util.checkExists = function(dependencies, container, silent) {
        var properties, value, exists, complain;
        
        complain = function(dependency, exists) {
            if (!silent && !exists) {
                console.log(dependency + ' is undefined.');
            }
        };
        value = container || window;
        
        if (_.isArray(dependencies)) {
            _.each(dependencies, function(single) {
                properties = single.split('.');

                _.each(properties, function(property) {
                    value = value[property];
                });

                exists = !_.isUndefined(value);
                complain(single, exists);
                
                // need to reset value for next iteration
                value = container || window;
                return exists;
            }, this);
        } else {
            properties = dependencies.split('.');
            _.each(properties, function(property) {
                value = value[property];
            });
            
            exists = !_.isUndefined(value);
            complain(dependencies, exists);
        }
        return exists;
    };

    _.extend(window.Golem, { Util : Util });
}(this, document, _));