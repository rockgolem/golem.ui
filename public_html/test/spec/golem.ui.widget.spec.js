describe('Golem.UI.Widget', function() {
    describe('Collection', function() {
        var C;
        beforeEach(function() {
            C = Golem.UI.Widget.buildWidget({ type : 'Collection' });
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
            it('can place an item at a specified index', function() {
                C.add('c', 2);
                expect(C.list[2]).toBe('c');
            });
            it('will place an item in an undefined index if no index is specified', function() {
                C.add('d').add('e');
                expect(_.contains(C.list, 'd') && _.contains(C.list, 'e')).toBe(true);
            });
            it('can place an item at a specified row / column', function() {
                C.add('item', { row : 1, column : 4});
                expect(C.list[3]).toBe('item');
            });
        });
        describe('get', function() {
            it('can retrieve items by index', function() {
                C.add('item', 2);
                expect(C.get(2)).toBe('item');
            });
            it('can retrieve items by row / column', function() {
                C.add('item', { row : 1, column : 3});
                expect(C.get({ row : 1, column : 3})).toBe('item');
            });
        });
        describe('getPosition', function() {
            it('returns an object with the row / column if passed an index', function() {
                var p;
                C.setDimensions(5,14);
                p = C.getPosition(63);
                expect(p.row).toBe(5);
                expect(p.column).toBe(8);
            });
            it('returns an index if passed an object with the row / column', function() {
                C.setDimensions(5,14);
                expect(C.getPosition({ row : 5, column : 3})).toBe(58);
            });
        });
    });
});