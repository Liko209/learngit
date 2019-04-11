/*
 * @Author: steven.zhuang
 * @Date: 2018-11-23 15:39:47
 * Copyright © RingCentral. All rights reserved.
 */

import { Upgrade } from '../Upgrade';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

ServiceLoader.getInstance = jest
  .fn()
  .mockImplementation((serviceName: string) => {
    if (ServiceConfig.ITEM_SERVICE === serviceName) {
      return {
        hasUploadingFiles: () => {
          return false;
        },
      };
    }

    if (ServiceConfig.TELEPHONY_SERVICE === serviceName) {
      return {
        getAllCallCount: () => {
          return 0;
        },
      };
    }

    return null;
  });

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
