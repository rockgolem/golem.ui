describe('Golem.UI', function() {
    describe('constructor', function() {
        var UI_NoOptions = new Golem.UI();
        it('prepares a canvas if no options are passed in', function() {
            expect(UI_NoOptions.canvas).toBeDefined();
        });
        it('uses a canvas passed in options hash instead of making a new one', function() {
            var externalCanvas = document.createElement('canvas'),
                UI = new Golem.UI({ canvas : externalCanvas });
            
            expect(UI.canvas).toBe(externalCanvas);
        });
        
        it('prepares the canvas by adding the `golem-stage` class', function() {
            expect($(UI_NoOptions.canvas).hasClass('golem-stage')).toBe(true);
        });
    
        it('resizes the canvas to fit the screen', function() {
            expect(UI_NoOptions.width).toBeGreaterThan(0);
            expect(UI_NoOptions.height).toBeGreaterThan(0);
            expect(UI_NoOptions.canvas.width).toBeGreaterThan(0);
            expect(UI_NoOptions.canvas.height).toBeGreaterThan(0);
        });
    
        it('creates an EaselJS stage', function() {
            expect(UI_NoOptions.stage instanceof createjs.Stage).toBe(true);
        });
    });
    
    describe('createCanvas', function() {
        it('returns a canvas DOM element', function() {
            var canvas = Golem.UI.createCanvas();
            expect(canvas.tagName).toEqual('CANVAS');
        });
    });
});