$(function() {
    var loader = new Golem.Preload([
        { id : 'Golem.UI', src : '/js/lib/ui/golem.ui.js' },
        { id : 'ExampleSkills', src : '/img/example-skills.jpg' }
    ]);

    loader.init(function() {
        loader.addAsset({
            id : 'Golem.UI.Widget',
            src : '/js/lib/ui/golem.ui.widget.js'
        }, function() {
            var body, ui, widget1, widget2;
            
            ui = new Golem.UI();
            body = $('body');
            
            body.append(ui.canvas);
            
            widget1 = ui.addWidget({
                type : 'ButtonBar',
                className : 'skill-bar',
                parent : body,
                x : 'middle',
                y : 'bottom',
                offsetY : 20,
                rows : 1,
                columns : 6,
                spriteSheet : {
                    images : ['/img/example-skills.jpg'],
                    frames : {
                        width : 50,
                        height : 50
                    }
                },
                buttons : [
                    {
                        index : 0,
                        state : 'on',
                        activeTime : 0,
                        activeTimeRemaining : 0,
                        rechargingTime : 2,
                        rechargingTimeRemaining : 0
                    },
                    {
                        index : 1,
                        state : 'on',
                        activeTime : 0,
                        activeTimeRemaining : 0,
                        rechargingTime : 5,
                        rechargingTimeRemaining : 0
                    },
                    {
                        index : 2,
                        state : 'on',
                        activeTime : 2,
                        activeTimeRemaining : 0,
                        rechargingTime : 10,
                        rechargingTimeRemaining : 0
                    },
                    {
                        index : 3,
                        state : 'on',
                        activeTime : 3,
                        activeTimeRemaining : 0,
                        rechargingTime : 30,
                        rechargingTimeRemaining : 0
                    },
                    {
                        index : 4,
                        state : 'off',
                        activeTime : 2,
                        activeTimeRemaining : 0,
                        rechargingTime : 10,
                        rechargingTimeRemaining : 0
                    },
                    {
                        index : 5,
                        state : 'disabled',
                        activeTime : 2,
                        activeTimeRemaining : 0,
                        rechargingTime : 10,
                        rechargingTimeRemaining : 0
                    }
                    
                ]
            });
            
            widget2 = ui.addWidget({
                type : 'ButtonBar',
                className : 'side-bar',
                parent : body,
                x : 'right',
                y : 'middle',
                offsetX : 20,
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
        
            widget2.updateButton(0, {
                index : 0,
                state : 'on',
                activeTime : 0,
                activeTimeRemaining : 0,
                rechargingTime : 2,
                rechargingTimeRemaining : 0
            });
            widget2.updateButton({row : 2, column : 1 }, {
                index : 1,
                state : 'on',
                activeTime : 0,
                activeTimeRemaining : 0,
                rechargingTime : 6,
                rechargingTimeRemaining : 0
            });
        
            ui.render();
        });
    });
});