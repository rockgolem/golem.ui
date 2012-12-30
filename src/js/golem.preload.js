    var Preload;
    
    /**
     * PreloadJS Wrapper
     * 
     * @class Preload
     * @constructor
     * @param {Array} manifest { src : 'path/to/resource', id : 'Global.Object'}
     */
    Preload = function(manifest) {
        
        // check for missing dependencies
        Golem.Util.checkExists([
            'createjs.PreloadJS'
        ]);
    
        this.p = new createjs.PreloadJS();
        this.manifest = _.isUndefined(manifest) ? [] : manifest;
        this.head = document.getElementsByTagName('head')[0];
        this.body = document.body;
        this.loaded = false;
    };
    
    /**
     * Used to add assets to the manifest.  Pass in a single Object, or an
     * Array of objects.  If the initial manifest is already loaded or has
     * already started loading--or if a callback is provided--this method
     * will automatically load the asset.
     * 
     * Returns a boolean indicating if the manifest has already started loading.
     * 
     * @param {Mixed} manifest
     * @param {Function} callback
     * @return Boolean
     */
    Preload.prototype.addAsset = function(manifest, callback) {
        var loaded = this.loaded;
        
        if (_.isArray(manifest)) {
            this.manifest = this.manifest.concat(manifest);
        } else {
            this.manifest.push(manifest);
        }
    
        if(loaded || _.isFunction(callback)) {
            this.load(callback);
        }
        return loaded;
    };
    
    /**
     * Starts loading the manifest.
     * 
     * @param {Function} callback
     * @returns void
     */
    Preload.prototype.init = function(callback) {
        this.p.onFileLoad = _.bind(this.handleFile, this);
        this.load(callback);
    };

    /**
     * Loads whatever might be in the manifest, clears the manifest, and
     * executes the callback when everything is finished.
     * 
     * @param {function} callback
     * @returns {undefined}
     */
    Preload.prototype.load = function(callback) {
        var p = this.p;
        this.loaded = true;
        p.onComplete = this.getCallback(callback);
        p.loadManifest(this.manifest);
    };
    
    /**
     * Callback for handling loaded files.  Can normally be left alone.
     * Overwrite before calling Preload.init to use a custom handler.
     * 
     * @param event Object returned by PreloadJS
     * @returns void
     */
    Preload.prototype.handleFile = function(event) {
        var p = createjs.PreloadJS;
        
        switch (event.type) {
            case p.CSS : this.head.appendChild(event.result); break;
            case p.JAVASCRIPT : document.body.appendChild(event.result); break;
            case p.SOUND : this.body.appendChild(event.result); break;
            case p.IMAGE : break;
            case p.JSON : break;
            case p.XML : break;
        }
    };
    
    /**
     * Returns a wrapper function that will execute the callback only after the
     * Preloaded resource is available.
     * 
     * @param {function} callback
     */
    Preload.prototype.getCallback = function(callback) {
        var wrapped, p, manifest;
        
        p = this.p;
        manifest = this.manifest;
        callback = _.isFunction(callback) ? callback : function() {};
        
        wrapped = _.bind(function() {
            var loaded = _.all(manifest, function(file) {
                var parts, lib;
                if (_.last(file.src.split('.')) === 'js') {
                    parts = file.id.split('.');
                    lib = window;
                    _.each(parts, function(property) {
                        lib = lib[property];
                    });
                } else {
                    lib = true;
                }
                return !_.isUndefined(lib);
            });
        
            if (loaded) {
                this.manifest = [];
                callback();
            } else {
                setTimeout(wrapped, 1);
            }
        }, this);
        
        return wrapped;
    };

    _.extend(window.Golem, { Preload : Preload });