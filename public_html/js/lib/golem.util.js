// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var Util = {};
    
    Util.checkExists = function(dependencies, container) {
        var properties = dependencies.split('.'),
            value = container || window;
        _.each(properties, function(property) {
            value = value[property];
        });
    
        return !_.isUndefined(value);
    };

    _.extend(window.Golem, { Util : Util });
}(this, document, _));