describe('Golem.Util', function() {
    describe('checkExists utility', function() {
        console.log('"something is undefined" logs below are a normal part of the unit tests.');
        it('verifies a property exists', function() {
            expect(Golem.Util.checkExists('prop', { prop : 'exists' })).toBe(true);
        });
        it('verifies a property does not exist', function() {
            expect(Golem.Util.checkExists('TestUndefined', { })).toBe(false);
        });
        it('defaults to the window object if a context is not provided', function() {
            expect(Golem.Util.checkExists('jasmine')).toBe(true);
        });
        it('can handle dot notation to check for nested properties', function() {
            expect(Golem.Util.checkExists('Golem.Util')).toBe(true);
        });
        it('can handle an array of properties', function() {
            expect(Golem.Util.checkExists(['Golem', 'jasmine'])).toBe(true);
        });
        it('returns false if a single item in an array does not exist', function() {
            expect(Golem.Util.checkExists(['Golem.Util', 'Golem.WTF'])).toBe(false);
        });
        it('complains to the console if something does not exist', function() {
            spyOn(console, 'log');
            Golem.Util.checkExists('WTF');
            expect(console.log).toHaveBeenCalledWith('WTF is undefined.');
        });
        it('Keeps quiet if something does not exist but the silent parameter is true', function() {
            spyOn(console, 'log');
            Golem.Util.checkExists('WTF', window, true);
            expect(console.log).not.toHaveBeenCalledWith('WTF is undefined.');
        });
    });

    describe('EventEmitter', function() {
        var Test, Klass = function() { };
        _.extend(Klass.prototype, Golem.Util.EventEmitter);
        
        Test = new Klass();
        
        afterEach(function() {
            Test.off();
        });
    
        it('can attach an eventRegistry to an object instance', function() {
            Test.on('someEvent', function() { });
            expect(Test._eventRegistry.someEvent).toBeDefined();
        });
        it('can attach multiple callbacks to the same event', function() {
            Test.on('event1', function() { }).on('event1', function() { });
            
            // two keys are stored per event
            expect(Test._eventRegistry.event1.length).toBe(4);
        });
        it('will trigger a bound callback if the event is emitted', function() {
            var k = false;
            Test.on('someEvent', function() { k = true; });
            Test.emit('someEvent');
            expect(k).toBe(true);
        });
    });
});