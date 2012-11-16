(function(window, document, createjs, _, undefined) {
    var Golem, Preload;
    
    /**
     * PreloadJS Wrapper
     * 
     * @constructor
     */
    Preload = function() {
        this.p = new (createjs.PreloadJS)();
        this.manifest = [
            'http://localhost/js/lib/golem.ui.js'
        ];
        this.head = document.getElementsByTagName('head')[0];
        this.body = document.body;
    };

    Preload.prototype.init = function() {
        var p = this.p;
        p.loadManifest(this.manifest, false);
        p.onFileLoad = _.bind(this.handleFile, this);
        p.load();
    };

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
     * Rock Golem Namespace
     */
    Golem = window.Golem || {};
    Golem.Preload = Preload;
    
    /**
     * DOM Ready event
     */
    $(function() {
        var preload = new Golem.Preload();
        
        preload.init();
    });
    
    window.Golem = Golem;
}(window, document, createjs, _));