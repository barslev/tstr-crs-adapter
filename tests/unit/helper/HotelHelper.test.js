import HotelHelper from '../../../src/helper/HotelHelper';

describe('HotelHelper', () => {
    let helper;

    beforeEach(() => {
        helper = new HotelHelper({});
    });

    it('calculateTravellerAllocation should return 1 for no information', () => {
        expect(helper.calculateTravellerAllocation()).toBe('1');
    });

    it('calculateTravellerAllocation should return 1-4 for 2 occupied rooms by 2 persons', () => {
        expect(helper.calculateTravellerAllocation({roomOccupancy: 2, roomQuantity: 2})).toBe('1-4');
    });

    it('calculateTravellerAllocation should return 5 for a traveller on position 5', () => {
        expect(helper.calculateTravellerAllocation({}, 5)).toBe('5');
    });

    it('calculateTravellerAllocation should return 3-5 for a occupied room by 3 persons and a traveller on position 5', () => {
        expect(helper.calculateTravellerAllocation({roomOccupancy: 3}, 3)).toBe('3-5');
    });

    it('isServiceMarked should return true for empty code', () => {
        expect(helper.isServiceMarked({})).toBeTruthy();
    });

    it('isServiceMarked should return true for empty accommodation', () => {
        expect(helper.isServiceMarked({code: 'code'})).toBeTruthy();
    });

    it('isServiceMarked should return false for complete data', () => {
        expect(helper.isServiceMarked({code: 'code', accommodation: 'accommodation'})).toBeFalsy();
    });
});
