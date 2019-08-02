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

    if (ServiceConfig.SYNC_SERVICE === serviceName) {
      return {
        isDataSyncing: () => {
          return false;
        },
      };
    }

    return null;
  });

describe('Upgrade trigger', () => {
  let upgradeHandler: Upgrade | undefined;

  afterEach(() => {
    upgradeHandler = undefined;
  });

  it('should reload when new update event by installing worker event', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    upgradeHandler.setServiceWorkerURL('/service-worker.js', false);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_appInFocus').mockReturnValue(false);
    jest
      .spyOn(upgradeHandler, '_hasServiceWorkerController')
      .mockReturnValue(false);
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);
    upgradeHandler.onNewContentAvailable(true, false);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toHaveBeenCalled();
  });

  it('should reload when new update event by waiting worker state', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    upgradeHandler.setServiceWorkerURL('/service-worker.js', false);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_appInFocus').mockReturnValue(false);
    jest
      .spyOn(upgradeHandler, '_hasServiceWorkerController')
      .mockReturnValue(false);
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);
    upgradeHandler.onNewContentAvailable(true, true);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toHaveBeenCalled();
  });

  it('should not run into infinite reload when new update event by waiting worker', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    upgradeHandler._removeWorkingWorkerFlag();

    upgradeHandler.setServiceWorkerURL('/service-worker.js', true);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, '_appInFocus').mockReturnValue(false);
    jest
      .spyOn(upgradeHandler, '_hasServiceWorkerController')
      .mockReturnValue(false);
    jest.spyOn(upgradeHandler, '_reloadApp').mockImplementation(mockFn);

    upgradeHandler.onNewContentAvailable(true, true);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).toHaveBeenCalled();
    mockFn.mockReset();

    upgradeHandler.onNewContentAvailable(true, true);
    upgradeHandler.reloadIfAvailable('Test');
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('manual update', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler.setServiceWorkerURL('/service-worker.js', false);
    const mockFn = jest.fn();
    jest.spyOn(upgradeHandler, 'logInfo').mockImplementation(mockFn);
    upgradeHandler._queryIfHasNewVersion();
    expect(upgradeHandler.logInfo).toHaveBeenCalled();
  });
});

describe('Upgrade limitation', () => {
  let upgradeHandler: Upgrade | undefined;

  afterEach(() => {
    upgradeHandler = undefined;
  });
  it('Should allow to reload when in idle', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    expect(upgradeHandler._canDoReload()).toBeTruthy();
  });
  it('Should not allow to reload when app is not focused', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    expect(upgradeHandler._canDoReload()).toBeTruthy();
    jest.spyOn(upgradeHandler, '_appInFocus').mockReturnValue(true);
    expect(upgradeHandler._canDoReload()).toBeFalsy();
  });
  it('Should not allow to reload when syncing index', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    expect(upgradeHandler._canDoReload()).toBeTruthy();
    jest.spyOn(upgradeHandler, '_isInDataSyncing').mockReturnValue(true);
    expect(upgradeHandler._canDoReload()).toBeFalsy();
  });
  it('Should not allow to reload when uploading file', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    expect(upgradeHandler._canDoReload()).toBeTruthy();
    jest.spyOn(upgradeHandler, '_isInFileUploading').mockReturnValue(true);
    expect(upgradeHandler._canDoReload()).toBeFalsy();
  });
  it('Should not allow to reload when has call in progress', () => {
    upgradeHandler = new Upgrade();
    upgradeHandler._lastUserActionTime = 0;
    expect(upgradeHandler._canDoReload()).toBeTruthy();
    jest.spyOn(upgradeHandler, '_hasInProgressCall').mockReturnValue(true);
    expect(upgradeHandler._canDoReload()).toBeFalsy();
  });
});
