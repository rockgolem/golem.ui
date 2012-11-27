$(function() {
    var loader = new Golem.Preload([
        { id : 'Golem.UI', src : '/js/lib/ui/golem.ui.js' }
    ]);

    loader.init(function() {
        loader.addAsset({
            id : 'Golem.UI.Widget',
            src : '/js/lib/ui/golem.ui.widget.js'
        }, function() {
            var ui = new Golem.UI();
            console.log(Golem.UI.Widget);
            $('body').append(ui.canvas);
            
            ui.addWidget({ type : 'ButtonBar' });
        });
    });
});