import { isEmpty, isMultipleLine } from '../helper';

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
  describe('isMultipleLine()', () => {
    it('should be false when input is <p><br></p>', () => {
      const result = isMultipleLine('<p><br></p>');
      expect(result).toBeFalsy();
    });
    it('should be true when input is <p><br></p><p><br></p><p><br></p>', () => {
      const result = isMultipleLine('<p><br></p><p><br></p><p><br></p>');
      expect(result).toBeTruthy();
    });
    it('should be true when input is <p><br></p><p>www</p>', () => {
      const result = isMultipleLine('<p><br></p><p>www</p>');
      expect(result).toBeTruthy();
    });
  });
});
