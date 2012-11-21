// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var Util = {};
    
    Util.checkExists = function(dependencies, container) {
        var properties, value, exists;
        
        if (_.isArray(dependencies)) {
            _.each(dependencies, function(single) {
                this.checkExists(single, container);
            }, this);
        } else {
            properties = dependencies.split('.');
            value = container || window;

            _.each(properties, function(property) {
                value = value[property];
            });

            exists = !_.isUndefined(value);

            if (!exists) {
                console.log(dependencies + ' is undefined.');
            }
        }
        return exists;
    };

    _.extend(window.Golem, { Util : Util });
}(this, document, _));