import { LogUploader } from '../LogUploader';
import { LogEntity } from 'foundation';
import AccountService, { UserConfig } from '../../account';
jest.mock('../../account');

describe('LogUploader', () => {
  const accountService = new AccountService();
  AccountService.getInstance = jest.fn().mockReturnValue(accountService);
  (accountService.getUserEmail as jest.Mock).mockResolvedValue('abc@rc.com');
  (UserConfig.getCurrentUserId as jest.Mock).mockReturnValue(12345);
  (accountService.getClientId as jest.Mock).mockReturnValue('54321');
  const logUploader = new LogUploader();
  describe('upload()', () => {
    it('should append userInfo', async () => {
      const mockLog = new LogEntity();
      const spy = jest.fn();
      logUploader.doUpload = spy;
      await logUploader.upload([mockLog]);
      expect(spy).toBeCalledTimes(1);
    });
  });
});
