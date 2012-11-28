describe('Golem.Preload', function() {
    var cleanup = function() {
        delete Golem.unit_test1;
        delete Golem.unit_test2;
    };
    describe('constructor', function() {
        var loader = new Golem.Preload([
            { id : 'Golem.unit_test1', src : '/test/src/preloader.data1.js' }
        ]);
        afterEach(cleanup);
        it('takes a manifest and stores it', function() {
            expect(loader.manifest.length).toBe(1);
        });
        it('does not immediately load the manifest', function() {
            expect(Golem.unit_test1).toBeUndefined();
        });
    });
    
    describe('addAsset', function() {
        var loader = new Golem.Preload();
        afterEach(function() { loader.manifest = []; cleanup(); });
        it('appends an asset to the manifest', function() {
            expect(loader.manifest.length).toBe(0);
            loader.addAsset({
                id : 'Golem.unit_test', src : '/test/src/preloader.data.js'
            });
            expect(loader.manifest.length).toBe(1);
        });
        it('can append multiple assets to the manifest', function() {
            expect(loader.manifest.length).toBe(0);
            loader.addAsset([
                { id : 'Golem.unit_test1', src : '/test/src/preloader.data1.js' },
                { id : 'Golem.unit_test2', src : '/test/src/preloader.data2.js' }
            ]);
            expect(loader.manifest.length).toBe(2);
        });
    });

    describe('init', function() {
        afterEach(cleanup);
        it('attaches the file handler and loads the manifest', function() {
            var loader = new Golem.Preload([
                { id : 'Golem.unit_test1', src : '/test/src/preloader.data1.js' },
                { id : 'Golem.unit_test2', src : '/test/src/preloader.data2.js' }
            ]);
            loader.init(function() {
                expect(Golem.unit_test1).toBeDefined();
                expect(Golem.unit_test2).toBeDefined();
            });
        });
    });

    describe('handleFile', function() {
        it('gets called for every loaded file in the manifest', function() {
            var loader = new Golem.Preload([
                { id : 'Golem.unit_test1', src : '/test/src/preloader.data1.js' },
                { id : 'Golem.unit_test2', src : '/test/src/preloader.data2.js' }
            ]);
            spyOn(loader, 'handleFile');
            loader.init(function() {
                expect(loader.handleFile.callCount).toBe(2);
            });
        });
    });
});