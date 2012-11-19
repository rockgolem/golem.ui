// namespace
this.Golem = this.Golem || {};

(function(window, document, createjs, _, undefined) {
    var Preload;
    
    /**
     * PreloadJS Wrapper
     * 
     * @class Preload
     * @constructor
     * @param manifest Array optional
     */
    Preload = function(manifest) {
        
        // check for missing dependencies
        Golem.Util.checkExists([
            'createjs.PreloadJS'
        ]);
    
        this.p = new createjs.PreloadJS();
        this.manifest = _.isArray(manifest) ? manifest : [];
        this.head = document.getElementsByTagName('head')[0];
        this.body = document.body;
        this.loaded = false;
    };
    
    /**
     * Used to add assets to the manifest.  Pass in a single String path, or an
     * Array of paths.  If the initial manifest is already loaded or has already
     * started loading, this method handles it gracefully.
     * 
     * Returns a boolean indicating if the manifest has already started loading.
     * 
     * @param Mixed manifest String or Array of Strings
     * @return Boolean
     */
    Preload.prototype.addAsset = function(manifest) {
        var loaded = this.loaded;
        if (_.isArray(manifest)) {
            loaded ? p.loadManifest(manifest) : this.manifest + manifest;
        } else {
            loaded ? p.loadFile(manifest) : this.manifest.push(manifest);
        }
        return loaded;
    };
    
    /**
     * Starts loading the manifest.
     * 
     * @returns void
     */
    Preload.prototype.init = function() {
        var p = this.p;
        
        if (!this.loaded) {
            p.loadManifest(this.manifest, false);

            this.loaded = true;

            p.onFileLoad = _.bind(this.handleFile, this);
            p.load();
        }
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

    _.extend(window.Golem, { Preload : Preload });
}(this, document, createjs, _));