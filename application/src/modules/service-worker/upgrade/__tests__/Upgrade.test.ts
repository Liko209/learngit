/*
 * @Author: steven.zhuang
 * @Date: 2018-11-23 15:39:47
 * Copyright © RingCentral. All rights reserved.
 */

import { Upgrade } from '../Upgrade';

jest.mock('sdk/module/item/service', () => ({
  ItemService: {
    getInstance: () => {
      return {
        hasUploadingFiles: () => {
          return false;
        },
      };
    },
  },
}));

jest.mock('sdk/module/telephony', () => ({
  TelephonyService: {
    getInstance: () => {
      return {
        getAllCallCount: () => {
          return 0;
        },
      };
    },
  },
}));

describe('Upgrade', () => {
  let upgradeHandler: Upgrade | undefined;

  afterEach(() => {
    upgradeHandler = undefined;
  });

  it('new version', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler.setServiceWorkerURL('/service-worker.js');
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);
    upgradeHandler.onNewContentAvailable();
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toBeCalled();
  });
});
