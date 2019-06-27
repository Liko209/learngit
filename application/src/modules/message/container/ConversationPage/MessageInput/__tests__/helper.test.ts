import { isEmpty } from '../helper';
describe('helper', () => {
  describe('isEmpty()', () => {
    it('should be true when input is ""', () => {
      expect(isEmpty('')).toBeTruthy();
    });
    it('should be true when input is "<p><br/></p>"', () => {
      expect(isEmpty('<p><br/></p>')).toBeTruthy();
    });
    it('should be false when input is "<p>hooray!</p>"', () => {
      expect(isEmpty('<p>hooray!</p>')).toBeFalsy();
    });
  });
});
