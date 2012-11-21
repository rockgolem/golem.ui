describe('Golem.Preload', function() {
    describe('constructor', function() {
        var loader = new Golem.Preload([
            { id : 'Golem.unit_test', src : '/test/src/preloader.data.js' }
        ]);
        it('takes a manifest and stores it', function() {
            expect(loader.manifest.length).toBe(1);
        });
        it('does not immediately load the manifest', function() {
            expect(Golem.unit_test).toBeUndefined();
        });
    });
});