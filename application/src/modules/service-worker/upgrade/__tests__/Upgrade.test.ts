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

  it('should reload when new update event by installing worker event', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler.setServiceWorkerURL('/service-worker.js', false);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);
    upgradeHandler.onNewContentAvailable(true, false);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toBeCalled();
  });

  it('should reload when new update event by waiting worker state', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler.setServiceWorkerURL('/service-worker.js', false);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);
    upgradeHandler.onNewContentAvailable(true, true);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toBeCalled();
  });

  it('should not run into infinite reload when new update event by waiting worker', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._removeWorkingWorkerFlag();

    upgradeHandler.setServiceWorkerURL('/service-worker.js', true);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);

    upgradeHandler.onNewContentAvailable(true, true);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toBeCalled();
    mockFn.mockReset();

    upgradeHandler.onNewContentAvailable(true, true);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).not.toBeCalled();
  });

  it('manual update', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler.setServiceWorkerURL('/service-worker.js', false);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, 'logInfo').mockImplementation(mockFn);
    upgradeHandler._queryIfHasNewVersion();
    expect(upgradeHandler.logInfo).toBeCalled();
  });
});
