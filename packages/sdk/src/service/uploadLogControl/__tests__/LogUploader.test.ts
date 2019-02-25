import { LogUploader } from '../LogUploader';
import { LogEntity } from 'foundation';
import AccountService from '../../account';
import { AccountGlobalConfig } from '../../../service/account/config';
import { GlobalConfigService } from '../../../module/config';

jest.mock('../../account');
jest.mock('../../../module/config');
jest.mock('../../../service/account/config');

GlobalConfigService.getInstance = jest.fn();

describe('LogUploader', () => {
  const accountService = new AccountService();
  const accountConfig = new AccountGlobalConfig(null);
  AccountGlobalConfig.getInstance = jest.fn().mockReturnValue(accountConfig);
  jest.spyOn(accountConfig, 'getCurrentUserId').mockReturnValue(12345);

  AccountService.getInstance = jest.fn().mockReturnValue(accountService);
  (accountService.getUserEmail as jest.Mock).mockResolvedValue('abc@rc.com');

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
