/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-07-09 16:49:47
 * Copyright © RingCentral. All rights reserved.
 */

import { PowerMonitor } from '../PowerMonitor';

describe('PowerMonitor', () => {
  const powerMonitor = new PowerMonitor();

  it('onPowerMonitorEvent', () => {
    const lockHandler = jest.fn();
    const unlockHandler = jest.fn();
    const suspendHandler = jest.fn();
    const resumeHandler = jest.fn();

    powerMonitor.onLock(lockHandler);
    powerMonitor.onUnlock(unlockHandler);
    powerMonitor.onSuspend(suspendHandler);
    powerMonitor.onResume(resumeHandler);

    expect(powerMonitor.isScreenLocked()).toBeFalsy();
    expect(powerMonitor.isSuspended()).toBeFalsy();

    powerMonitor.onPowerMonitorEvent('lock-screen');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeFalsy();
    expect(lockHandler).toHaveBeenCalledTimes(1);
    expect(unlockHandler).toHaveBeenCalledTimes(0);

    powerMonitor.onPowerMonitorEvent('lock-screen');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeFalsy();
    expect(lockHandler).toHaveBeenCalledTimes(1);
    expect(unlockHandler).toHaveBeenCalledTimes(0);

    powerMonitor.onPowerMonitorEvent('unlock-screen');
    expect(powerMonitor.isScreenLocked()).toBeFalsy();
    expect(powerMonitor.isSuspended()).toBeFalsy();
    expect(lockHandler).toHaveBeenCalledTimes(1);
    expect(unlockHandler).toHaveBeenCalledTimes(1);

    powerMonitor.offLock(lockHandler);
    powerMonitor.offUnlock(unlockHandler);
    powerMonitor.onPowerMonitorEvent('lock-screen');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeFalsy();
    expect(lockHandler).toHaveBeenCalledTimes(1);
    expect(unlockHandler).toHaveBeenCalledTimes(1);

    powerMonitor.onPowerMonitorEvent('resume');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeFalsy();
    expect(suspendHandler).toHaveBeenCalledTimes(0);
    expect(resumeHandler).toHaveBeenCalledTimes(0);

    powerMonitor.onPowerMonitorEvent('suspend');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeTruthy();
    expect(suspendHandler).toHaveBeenCalledTimes(1);
    expect(resumeHandler).toHaveBeenCalledTimes(0);

    powerMonitor.onPowerMonitorEvent('resume');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeFalsy();
    expect(suspendHandler).toHaveBeenCalledTimes(1);
    expect(resumeHandler).toHaveBeenCalledTimes(1);

    powerMonitor.offSuspend(suspendHandler);
    powerMonitor.offResume(resumeHandler);
    powerMonitor.onPowerMonitorEvent('suspend');
    expect(powerMonitor.isScreenLocked()).toBeTruthy();
    expect(powerMonitor.isSuspended()).toBeTruthy();
    expect(suspendHandler).toHaveBeenCalledTimes(1);
    expect(resumeHandler).toHaveBeenCalledTimes(1);

    powerMonitor.offAll();
  });
});
