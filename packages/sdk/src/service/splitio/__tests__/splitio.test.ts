/*
 * @Author: steven.zhuang
 * @Date: 2018-11-13 20:39:29
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIO } from '../splitio';
import { SplitIOClient } from '../splitioClient';
import notificationCenter from '../../../service/notificationCenter';
import { SERVICE } from '../../../service/eventKey';
import { SplitIOSdkClient } from '../__mocks__/splitioSdkClient';
import { GlobalConfigService } from '../../../module/config';
import { AccountGlobalConfig } from '../../../service/account/config';

jest.mock('../../../dao');
jest.mock('../../../module/config');
jest.mock('../../../service/account/config');
GlobalConfigService.getInstance = jest.fn();

const sdkClient = new SplitIOSdkClient();
const mockedFactorySplitClient = jest.fn(
  (settings: SplitIO.IBrowserSettings) => {
    return sdkClient;
  },
);
SplitIOClient.prototype = {
  ...SplitIOClient.prototype,
  factorySplitClient: mockedFactorySplitClient,
};

describe('SplitIO', async () => {
  const splitio = new SplitIO();
  jest.spyOn(splitio, '_getAuthKey').mockImplementation(() => {
    return 'aiers1fdmskm7paalb3ubhhuumaauv21rnti';
  });

  const testUserId = '111';
  const companyId = '222';
  let mock = {
    user_id: testUserId,
    company_id: companyId,
  };

  beforeAll(() => {});

  beforeEach(() => {
    mock = {
      user_id: testUserId,
      company_id: companyId,
    };

    AccountGlobalConfig.getCurrentUserId = jest
      .fn()
      .mockReturnValue(mock.user_id);
    AccountGlobalConfig.getCurrentCompanyId = jest
      .fn()
      .mockReturnValue(mock.company_id);
  });

  afterEach(() => {
    notificationCenter.emitKVChange(SERVICE.LOGOUT);
    mockedFactorySplitClient.mockClear();
  });

  describe('login & logout', async () => {
    it('login - user info ready', () => {
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(splitio.hasCreatedClient(testUserId)).toBeTruthy();

      sdkClient.emit(sdkClient.Event.SDK_READY, {});
    });

    it('login - user id not ready', () => {
      AccountGlobalConfig.getCurrentUserId = jest.fn().mockReturnValue('');
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
    });

    it('login - company id not ready', () => {
      AccountGlobalConfig.getCurrentCompanyId = jest.fn().mockReturnValue('');
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
    });

    it('logout', () => {
      notificationCenter.emitKVChange(SERVICE.LOGOUT);
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
    });
  });

  describe('index done', async () => {
    it('first index done', () => {
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_DONE);
      expect(splitio.hasCreatedClient(testUserId)).toBeTruthy();
    });

    it('multiple event', () => {
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(splitio.hasCreatedClient(testUserId)).toBeTruthy();
      expect(mockedFactorySplitClient).toHaveBeenCalledTimes(1);

      // Index after login
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_DONE);
      expect(mockedFactorySplitClient).toHaveBeenCalledTimes(1);

      // second index
      notificationCenter.emitKVChange(SERVICE.FETCH_INDEX_DATA_DONE);
      expect(mockedFactorySplitClient).toHaveBeenCalledTimes(1);
      expect(splitio.hasCreatedClient(testUserId)).toBeTruthy();
    });
  });
});
