$(function() {
    var loader = new Golem.Preload([
        { id : 'Golem.UI', src : '/js/lib/ui/golem.ui.js' }
    ]);

    loader.init(function() {
        if(Golem.Util.checkExists('createjs.PreloadJS')) {
            var UI = new Golem.UI();
            $('body').append(UI.canvas);
        }
    });
});