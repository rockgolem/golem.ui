describe('Golem.UI.Widget', function() {
    var W = new Golem.UI.Widget();
    
    it('has a position', function() {
        expect(W.position.x).toBe(0);
        expect(W.position.y).toBe(0);
    });
    
    it('can update it\'s position', function() {
        expect(W.position.x).toBe(0);
        expect(W.position.y).toBe(0);
        W.setPosition(10, 100);
        expect(W.position.x).toBe(10);
        expect(W.position.y).toBe(100);
    });
    
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