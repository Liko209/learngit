import { GlipAccount } from '../GlipAccount';

describe('GlipAccount', () => {
  describe('updateSupportedServices()', () => {
    it('should set supported services', () => {
      const glipAccount = new GlipAccount();
      jest.spyOn(glipAccount, 'setSupportedServices');
      glipAccount.updateSupportedServices(null);
      expect(glipAccount.setSupportedServices).toHaveBeenCalled();
    });
  });
});
