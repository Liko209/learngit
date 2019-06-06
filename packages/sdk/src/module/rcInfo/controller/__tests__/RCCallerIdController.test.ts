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
  {
    id: 1,
    usageType: 'DirectNumber',
    phoneNumber: '1',
    label: 'Direct Number',
  },
  {
    id: 2,
    usageType: 'MainCompanyNumber',
    phoneNumber: '1',
    label: 'Main Company Number',
  },
  {
    id: 0,
    usageType: 'Blocked',
    phoneNumber: 'Blocked',
    label: 'Blocked',
  },
  {
    id: 3,
    usageType: 'NickName',
    phoneNumber: '1',
    label: 'CompanyNumberWithNickname',
  },
  {
    id: 4,
    usageType: 'NickName',
    phoneNumber: '1',
    label: 'DirectNumberWithNickname',
  },
  {
    id: 5,
    usageType: 'NickName',
    phoneNumber: '1',
    label: 'MainCompanyNumberWithNickname',
  },
  {
    id: 4,
    usageType: 'CompanyNumber',
    phoneNumber: '1',
    label: 'Company Number',
  },
  {
    id: 5,
    usageType: 'AdditionalCompanyNumber',
    phoneNumber: '1',
    label: 'Company Number',
  },
  {
    id: 6,
    usageType: 'CompanyFaxNumber',
    phoneNumber: '1',
    label: 'Company Fax Number',
  },
];
describe('RCInfoFetchController', () => {
  let rcCallerIdController: RCCallerIdController;
  const mockFetchController = {
    getCallerIdList: jest.fn(),
    getRCAccountInfo: jest.fn(),
  } as any;

  function setUp() {
    rcCallerIdController = new RCCallerIdController(mockFetchController);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('getCallerIdList', () => {
    it('should return value as expect order when get caller id list', async () => {
      rcCallerIdController._rcInfoFetchController.getExtensionPhoneNumberList = jest
        .fn()
        .mockResolvedValue({
          records: [
            { id: 2, usageType: 'MainCompanyNumber', phoneNumber: '1' },
            { id: 6, usageType: 'CompanyFaxNumber', phoneNumber: '1' },
            { id: 10, usageType: 'ConferencingNumber', phoneNumber: '1' },
            { id: 7, usageType: 'ForwardedNumber', phoneNumber: '1' },
            {
              id: 3,
              usageType: 'CompanyNumber',
              phoneNumber: '1',
              label: 'CompanyNumberWithNickname',
            },

            { id: 1, usageType: 'DirectNumber', phoneNumber: '1' },
            { id: 8, usageType: 'ForwardedCompanyNumber', phoneNumber: '1' },

            { id: 5, usageType: 'AdditionalCompanyNumber', phoneNumber: '1' },
            {
              id: 4,
              usageType: 'DirectNumber',
              phoneNumber: '1',
              label: 'DirectNumberWithNickname',
            },
            { id: 9, usageType: 'ContactCenterNumber', phoneNumber: '1' },

            { id: 4, usageType: 'CompanyNumber', phoneNumber: '1' },
            {
              id: 5,
              usageType: 'MainCompanyNumber',
              phoneNumber: '1',
              label: 'MainCompanyNumberWithNickname',
            },
          ],
        });
      const result = await rcCallerIdController.getCallerIdList();
      expect(result).toEqual(expectResult);
    });

    it('should return default number when get caller id list is empty', async () => {
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
        {
          id: 2,
          usageType: 'DirectNumber',
          phoneNumber: '1',
          label: 'Direct Number',
        },
        {
          id: 1,
          usageType: 'MainCompanyNumber',
          phoneNumber: '1',
          label: 'Main Company Number',
        },
        {
          id: 0,
          usageType: 'Blocked',
          phoneNumber: 'Blocked',
          label: 'Blocked',
        },
      ]);
    });

    it('should return default number when can not get caller id list', async () => {
      rcCallerIdController._rcInfoFetchController.getExtensionPhoneNumberList = jest
        .fn()
        .mockResolvedValue(undefined);
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
        {
          id: 2,
          usageType: 'DirectNumber',
          phoneNumber: '1',
          label: 'Direct Number',
        },
        {
          id: 1,
          usageType: 'MainCompanyNumber',
          phoneNumber: '1',
          label: 'Main Company Number',
        },
        {
          id: 0,
          usageType: 'Blocked',
          phoneNumber: 'Blocked',
          label: 'Blocked',
        },
      ]);
    });

    it('should return default number when can not getCurrentUserInfo', async () => {
      rcCallerIdController._rcInfoFetchController.getExtensionPhoneNumberList = jest
        .fn()
        .mockResolvedValue(undefined);
      const accountService: AccountService = new AccountService(null);
      ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
      accountService.getCurrentUserInfo = jest.fn().mockReturnValue(undefined);
      const result = await rcCallerIdController.getCallerIdList();
      expect(result).toEqual([
        {
          id: 0,
          usageType: 'Blocked',
          phoneNumber: 'Blocked',
          label: 'Blocked',
        },
      ]);
    });
  });

  describe('getCallerById', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return undefined when can not find the caller by id', async () => {
      rcCallerIdController.getCallerIdList = jest.fn().mockResolvedValue([]);
      expect(await rcCallerIdController.getCallerById(1)).toEqual(undefined);
    });

    it('should return matched caller by id', async () => {
      rcCallerIdController.getCallerIdList = jest
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }]);
      expect(await rcCallerIdController.getCallerById(1)).toEqual({ id: 1 });
    });
  });

  describe('getFirstDidCaller', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return first direct number form caller list', async () => {
      rcCallerIdController.getCallerIdList = jest
        .fn()
        .mockResolvedValue([
          { id: 1, usageType: 'notDirectNumber' },
          { id: 2, usageType: 'DirectNumber' },
        ]);

      expect(await rcCallerIdController.getFirstDidCaller()).toEqual({
        id: 2,
        usageType: 'DirectNumber',
      });
    });
  });

  describe('getCompanyMainCaller', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return first company main number form caller list', async () => {
      rcCallerIdController.getCallerIdList = jest
        .fn()
        .mockResolvedValue([
          { id: 1, usageType: 'notDirectNumber' },
          { id: 2, usageType: 'DirectNumber' },
          { id: 3, usageType: 'MainCompanyNumber' },
        ]);

      expect(await rcCallerIdController.getCompanyMainCaller()).toEqual({
        id: 3,
        usageType: 'MainCompanyNumber',
      });
    });
  });
});
