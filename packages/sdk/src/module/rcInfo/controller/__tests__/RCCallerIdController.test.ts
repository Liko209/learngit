/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-13 11:20:40
 * Copyright © RingCentral. All rights reserved.
 */

import { RCCallerIdController } from '../RCCallerIdController';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader } from 'sdk/module/serviceLoader';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
const expectResult = [
  { id: 1, usageType: 'DirectNumber', phoneNumber: '1' },
  { id: 2, usageType: 'MainCompanyNumber', phoneNumber: '1' },
  { id: 0, usageType: 'Blocked', phoneNumber: 'Blocked' },
  { id: 3, usageType: 'CompanyNumber', phoneNumber: '1', label: 'nickname' },
  { id: 4, usageType: 'CompanyNumber', phoneNumber: '1' },
  { id: 5, usageType: 'CompanyFaxNumber', phoneNumber: '1' },
];
describe('RCInfoFetchController', () => {
  let rcCallerIdController: RCCallerIdController;
  const mockFetchController = {
    getCallerIdList: jest.fn(),
    getRCAccountInfo: jest.fn(),
  } as any;
  beforeEach(() => {
    clearMocks();
    rcCallerIdController = new RCCallerIdController(mockFetchController);
  });

  describe('getExtensionPhoneNumberList', () => {
    it('should return value as expect order when get caller id list', async () => {
      rcCallerIdController._rcInfoFetchController.getExtensionPhoneNumberList = jest
        .fn()
        .mockResolvedValue({
          records: [
            { id: 2, usageType: 'MainCompanyNumber', phoneNumber: '1' },
            { id: 5, usageType: 'CompanyFaxNumber', phoneNumber: '1' },
            {
              id: 3,
              usageType: 'CompanyNumber',
              phoneNumber: '1',
              label: 'nickname',
            },
            { id: 1, usageType: 'DirectNumber', phoneNumber: '1' },
            { id: 4, usageType: 'CompanyNumber', phoneNumber: '1' },
          ],
        });
      const result = await rcCallerIdController.getCallerIdList();
      expect(result).toEqual(expectResult);
    });

    it('should return default number when can not get caller id list', async () => {
      rcCallerIdController._rcInfoFetchController.getExtensionPhoneNumberList = jest
        .fn()
        .mockResolvedValue({
          records: [],
        });
      const accountService: AccountService = new AccountService(null);
      ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserInfo = jest.fn().mockReturnValue({
        rc_phone_numbers: [
          { id: 1, usageType: 'MainCompanyNumber', phoneNumber: '1' },
          { id: 2, usageType: 'DirectNumber', phoneNumber: '1' },
        ],
      });
      const result = await rcCallerIdController.getCallerIdList();
      expect(result).toEqual([
        { id: 2, usageType: 'DirectNumber', phoneNumber: '1' },
        { id: 1, usageType: 'MainCompanyNumber', phoneNumber: '1' },
        { id: 0, usageType: 'Blocked', phoneNumber: 'Blocked' },
      ]);
    });
  });
});
