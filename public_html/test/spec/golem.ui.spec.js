describe('Golem.UI', function() {
    var UI = new Golem.UI();
    describe('createCanvas', function() {
        it('returns a canvas DOM element', function() {
            var canvas = Golem.UI.createCanvas();
            expect(canvas.tagName).toEqual('CANVAS');
        });
    });
});