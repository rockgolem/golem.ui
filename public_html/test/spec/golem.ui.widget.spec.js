describe('Golem.UI.Widget', function() {
    describe('Collection', function() {
        var C;
        beforeEach(function() {
            C = new Golem.UI.Widget.Collection();
        });
        describe('setDimensions', function() {
            it('updates the list length', function() {
                C.setDimensions(1,4);
                expect(C.list.length).toBe(4);
                C.setDimensions(2,5);
                expect(C.list.length).toBe(10);
            });
            it('preserves list contents', function() {
                C.add('a').add('b');
                C.setDimensions(1,3);
                expect(_.contains(C.list, 'a') && _.contains(C.list, 'b')).toBe(true);
            });
        });
        describe('add', function() {
            it('places an item in an undefined index if no index is specified', function() {
                C.add('c').add('d');
                expect(_.contains(C.list, 'c') && _.contains(C.list, 'd')).toBe(true);
            });
        });
        describe('addToOverflow', function() {
            
        });
    });
});