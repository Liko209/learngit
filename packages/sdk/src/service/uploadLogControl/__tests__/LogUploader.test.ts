import { LogUploader } from '../LogUploader';
import { LogEntity } from 'foundation';
import AccountService, { UserConfig } from '../../account';
import { Api } from 'sdk/api';
import axios from 'axios';
jest.mock('sdk/api');
jest.mock('../../account');

describe('LogUploader', () => {
  Api.httpConfig = {};
  (axios.post as jest.Mock).mockResolvedValue({});
  const accountService = new AccountService();
  AccountService.getInstance = jest.fn().mockReturnValue(accountService);
  (accountService.getUserEmail as jest.Mock).mockResolvedValue('abc@rc.com');
  (UserConfig.getCurrentUserId as jest.Mock).mockReturnValue(12345);
  (accountService.getClientId as jest.Mock).mockReturnValue('54321');
  const logUploader = new LogUploader();
  describe('upload()', () => {
    it('should append userInfo', async () => {
      const mockLog = new LogEntity();
      await logUploader.upload([mockLog]);
      expect(axios.post).toBeCalledTimes(1);
    });
  });
});
