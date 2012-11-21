describe('Golem.Util', function() {
    describe('checkExists utility', function() {
        it('verifies a property exists', function() {
            expect(Golem.Util.checkExists('prop', { prop : true })).toEqual(true);
        });
    });
});