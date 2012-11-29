$(function() {
    var loader = new Golem.Preload([
        { id : 'Golem.UI', src : '/js/lib/ui/golem.ui.js' }
    ]);

    loader.init(function() {
        loader.addAsset({
            id : 'Golem.UI.Widget',
            src : '/js/lib/ui/golem.ui.widget.js'
        }, function() {
            var body, ui;
            
            ui = new Golem.UI();
            body = $('body');
            
            body.append(ui.canvas);
            
            ui.addWidget({
                type : 'ButtonBar',
                className : 'skill-bar',
                parent : body,
                x : 'middle',
                y : 'bottom',
                //offsetX : 10,
                offsetY : 20,
                rows : 1,
                columns : 6,
                spriteSheet : {
                    images : ['/img/example-skills.jpg'],
                    frames : {
                        width : 50,
                        height : 50
                    }
                }
            });
            
            ui.addWidget({
                type : 'ButtonBar',
                className : 'side-bar',
                parent : body,
                x : 'right',
                y : 'middle',
                offsetX : 20,
                //offsetY : 20,
                rows : 6,
                columns : 1,
                spriteSheet : {
                    images : ['/img/example-skills.jpg'],
                    frames : {
                        width : 50,
                        height : 50
                    }
                }
            });
            ui.render();
        });
    });
});