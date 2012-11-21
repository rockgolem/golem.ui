describe('Golem.Util', function() {
    describe('checkExists utility', function() {
        console.log('Seeing a couple of "something is undefined" logs below is normal.');
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
});