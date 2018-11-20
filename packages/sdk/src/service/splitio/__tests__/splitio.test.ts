/*
 * @Author: steven.zhuang
 * @Date: 2018-11-13 20:39:29
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIO } from '../splitio';
import { SplitIOClient } from '../splitioClient';
import notificationCenter from '../../../service/notificationCenter';
import { daoManager, AccountDao } from '../../../dao';
import { SERVICE } from '../../../service/eventKey';
import { SplitIOSdkClient } from '../__mocks__/splitioSdkClient';

jest.mock('../../../dao');

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

  let accountDao: AccountDao;
  const testUserId = '111';
  const companyId = '222';
  let mock = {
    user_id: testUserId,
    company_id: companyId,
  };

  beforeAll(() => {
    accountDao = new AccountDao(null);
  });

  beforeEach(() => {
    mock = {
      user_id: testUserId,
      company_id: companyId,
    };
    daoManager.getKVDao.mockReturnValue(accountDao);
    jest.spyOn(accountDao, 'get').mockImplementation((key: string) => {
      return mock[key];
    });
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
      mock.user_id = '';

      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
      notificationCenter.emitKVChange(SERVICE.LOGIN);
      expect(splitio.hasCreatedClient(testUserId)).toBeFalsy();
    });

    it('login - company id not ready', () => {
      mock.company_id = '';

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
