// namespace
this.Golem = this.Golem || {};

(function(window, document, _, undefined) {
    var Util, EventEmitter, logIfUndefined, separator = /\s+/;

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
                logIfUndefined(single, exists, silent);

                // need to reset value for next iteration
                value = container || window;
                return exists;
            }, this);
        } else {
            _.each(dependencies.split('.'), function(property) {
                value = value[property];
            });

            exists = !_.isUndefined(value);
            logIfUndefined(dependencies, exists, silent);
        }
        return exists;
    };

    /**
     * EventEmitter can be mixed into any object's prototype.
     */
    EventEmitter = {};

    /**
     * Bind a listener
     * 
     * @param {String} events space separated list
     * @param {Function} callback
     * @param {Mixed} context context for the callback.
     * @returns {EventEmitter}
     */
    EventEmitter.on = function(events, callback, context) {
        var registry, list;
        if (_.isFunction(callback)) {
            events = events.split(separator);
            registry = this._eventRegistry || (this._eventRegistry = {});
            _.each(events, function(event) {
                list = (registry[event] || (registry[event] = []));
                list.push(callback, context);
            });
        }
        return this;
    };

    /**
     * Remove a listener
     * 
     * @param {String} events space separated list
     * @param {Function} callback
     * @param {Mixed} context
     * @returns {EventEmitter}
     */
    EventEmitter.off = function(events, callback, context) {
        var registry, list, i;
        registry = this._eventRegistry;
        if (registry) {
            if (events || callback || context) {
                events = events ? events.split(separator) : _.keys(registry);

                _.each(events, function(event) {
                    list = registry[event];
                    if (!list || !(callback || context)) {
                        delete registry[event];
                    } else {
                        for (i = list.length - 2; i >= 0; i -= 2) {
                            if (!(
                                callback && list[i] !== callback ||
                                context && list[i + 1] !== context
                            )) {
                                list.splice(i, 2);
                            }
                        }
                    }
                });
            } else {
                delete this._eventRegistry;
            }
        }
        return this;
    };
    
    /**
     * Trigger all bound callbacks for the specified events
     * 
     * @param {String} events space separated list
     * @returns {EventEmitter}
     */
    EventEmitter.emit = function(events) {
        var registry, list, i, length, args, all, rest;
        
        registry = this._eventRegistry;
        
        if (registry) {
            rest = [];
            events = events.split(separator);
            for (i = 1, length = arguments.length; i < length; i++) {
                rest[i - 1] = arguments[i];
            }
            
            _.each(events, function(event) {
                all = (registry.all || []).slice();
                list = (registry[event] || []).slice();
                if (list.length) {
                    for (i = 0, length = list.length; i < length; i += 2) {
                        list[i].apply(list[i + 1] || this, rest);
                    }
                }
                if (all.length) {
                    args = [event].concat(rest);
                    for (i = 0, length = all.length; i < length; i += 2) {
                        all[i].apply(all[i + 1] || this, args);
                    }
                }
            });
        }
        return this;
    };

    Util.EventEmitter = EventEmitter;

    /**
     * Wrapper for a common console.log message
     * 
     * @param {String} dependency
     * @param {Boolean} exists
     * @param {Boolean} silent
     * @returns {undefined}
     */
    logIfUndefined = function(dependency, exists, silent) {
        if (!silent && !exists) {
            console.log(dependency + ' is undefined.');
        }
    };

    _.extend(window.Golem, {Util: Util});
}(this, document, _));