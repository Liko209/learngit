/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RCCallerIdController } from '../RCCallerIdController';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
const expectResult = [
  { usageType: 'DirectNumber' },
  { usageType: 'MainCompanyNumber' },
  { usageType: 'Blocked', phoneNumber: 'Blocked' },
  { usageType: 'CompanyNumber', label: 'nickname' },
  { usageType: 'CompanyNumber' },
  { usageType: 'CompanyFaxNumber' },
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
            { usageType: 'MainCompanyNumber' },
            { usageType: 'CompanyFaxNumber' },
            { usageType: 'CompanyNumber', label: 'nickname' },
            { usageType: 'DirectNumber' },
            { usageType: 'CompanyNumber' },
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
      rcCallerIdController._rcInfoFetchController.getRCAccountInfo = jest
        .fn()
        .mockResolvedValue({
          mainNumber: '1',
        });
      const result = await rcCallerIdController.getCallerIdList();
      expect(result).toEqual([
        { usageType: 'MainCompanyNumber', phoneNumber: '1' },
        { usageType: 'Blocked', phoneNumber: 'Blocked' },
      ]);
    });
  });
});
