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
            it('places an item at a specified index', function() {
                C.add('c', 2);
                expect(C.list[2]).toBe('c');
            });
            it('places an item in an undefined index if no index is specified', function() {
                C.add('d').add('e');
                expect(_.contains(C.list, 'd') && _.contains(C.list, 'e')).toBe(true);
            });
        });
        describe('addToOverflow', function() {
            
        });
    });
});