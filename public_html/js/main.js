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
                x : 100,
                y : 100,
                rows : 1,
                columns : 6,
                spriteSheet : {
                    images : ['/img/example-skills.jpg'],
                    frames : {
                        width : 50,
                        height : 50
                    },
                    animations : {
                        '1' : [0, 0, false],
                        '2' : [1, 1, false],
                        '3' : [2, 2, false],
                        '4' : [3, 3, false]
                    }
                }
            });
        
            XX = ui.widgets[0].spriteSheet;
            ui.render();
        });
    });
});