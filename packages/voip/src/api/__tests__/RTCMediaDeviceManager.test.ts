/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-04-30 13:52:45
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCMediaDeviceManager } from '../RTCMediaDeviceManager';

navigator.mediaDevices = {
  enumerateDevices: jest.fn(),
} as any;
describe('Media device', () => {
  const devices1: MediaDeviceInfo[] = [
    {
      deviceId: 'default',
      kind: 'audiooutput',
      label: 'Default - Output 1',
      groupId: '1',
    },
    {
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default - Input 1',
      groupId: '1',
    },
  ];
  const devices2: MediaDeviceInfo[] = [
    {
      deviceId: 'default',
      kind: 'audiooutput',
      label: 'Default - Output 2',
      groupId: '2',
    },
    {
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default - Input 2',
      groupId: '2',
    },
  ];
  const devices3: MediaDeviceInfo[] = [
    {
      deviceId: '123',
      kind: 'audiooutput',
      label: 'Default - Output 123',
      groupId: '2',
    },
    {
      deviceId: '345',
      kind: 'audioinput',
      label: 'Default - Input 345',
      groupId: '2',
    },
  ];
  const devices4: MediaDeviceInfo[] = [
    {
      deviceId: 'default',
      kind: 'audiooutput',
      label: 'Default - Output 4',
      groupId: '4',
    },
    {
      deviceId: 'a',
      kind: 'audiooutput',
      label: 'Default - Output a',
      groupId: '4',
    },
    {
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default - Input 4',
      groupId: '4',
    },
    {
      deviceId: 'a',
      kind: 'audioinput',
      label: 'Default - Input a',
      groupId: '4',
    },
  ];
  const devices5: MediaDeviceInfo[] = [
    {
      deviceId: 'default',
      kind: 'audiooutput',
      label: 'Default - Output 4',
      groupId: '4',
    },
    {
      deviceId: 'a',
      kind: 'audiooutput',
      label: 'Output 4',
      groupId: '4',
    },
    {
      deviceId: 'default',
      kind: 'audioinput',
      label: 'Default - Input 4',
      groupId: '4',
    },
    {
      deviceId: 'b',
      kind: 'audioinput',
      label: 'Input 4',
      groupId: '4',
    },
  ];
  it("should do nothing if device list doesn't change when add/remove device. [JPT-1728]", async () => {
    (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([
      ...devices1,
    ]);
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices1);

    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioInputDevice');
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioOutputDevice');
    await RTCMediaDeviceManager.instance()['_onMediaDevicesChange']();
    // RTCMediaDeviceManager.instance()._gotMediaDevices(devices1);
    expect(
      RTCMediaDeviceManager.instance().setAudioInputDevice,
    ).not.toBeCalled();
    expect(
      RTCMediaDeviceManager.instance().setAudioOutputDevice,
    ).not.toBeCalled();
  });

  it('should save device list if device changes when add/remove device. [JPT-1729]', () => {
    RTCMediaDeviceManager.instance().destroy();
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices1);
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioInputDevice');
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioOutputDevice');
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices2);
    expect(RTCMediaDeviceManager.instance().setAudioInputDevice).toBeCalled();
    expect(RTCMediaDeviceManager.instance().getAudioInputs()).toEqual([
      {
        deviceId: 'default',
        kind: 'audioinput',
        label: 'Default - Input 2',
        groupId: '2',
      },
    ]);
    expect(RTCMediaDeviceManager.instance().setAudioOutputDevice).toBeCalled();
    expect(RTCMediaDeviceManager.instance().getAudioOutputs()).toEqual([
      {
        deviceId: 'default',
        kind: 'audiooutput',
        label: 'Default - Output 2',
        groupId: '2',
      },
    ]);
  });

  it('should do nothing when device list changed but have no default id. [JPT-1730]', () => {
    RTCMediaDeviceManager.instance().destroy();
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices1);
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioInputDevice');
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioOutputDevice');
    jest.spyOn(RTCMediaDeviceManager.instance(), '_updateAudioDevices');
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices3);
    expect(
      RTCMediaDeviceManager.instance().setAudioInputDevice,
    ).not.toBeCalled();
    expect(
      RTCMediaDeviceManager.instance().setAudioOutputDevice,
    ).not.toBeCalled();
    expect(
      RTCMediaDeviceManager.instance()['_updateAudioDevices'],
    ).not.toBeCalled();
  });

  it("should save current device id = 'default' when real device id not found. [JPT-1731]", () => {
    RTCMediaDeviceManager.instance().destroy();
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices1);
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioInputDevice');
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioOutputDevice');
    RTCMediaDeviceManager.instance()._gotMediaDevices(devices4);
    expect(RTCMediaDeviceManager.instance().setAudioInputDevice).toBeCalledWith(
      'default',
    );
    expect(RTCMediaDeviceManager.instance().getCurrentAudioInput()).toBe(
      'default',
    );
    expect(
      RTCMediaDeviceManager.instance().setAudioOutputDevice,
    ).toBeCalledWith('default');
    expect(RTCMediaDeviceManager.instance().getCurrentAudioOutput()).toBe(
      'default',
    );
  });

  it('should save current device id as real device id when got real device id successfully. [JPT-1732]', async () => {
    RTCMediaDeviceManager.instance().destroy();
    // RTCMediaDeviceManager.instance()._gotMediaDevices(devices1);
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioInputDevice');
    jest.spyOn(RTCMediaDeviceManager.instance(), 'setAudioOutputDevice');
    (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([
      ...devices1,
      ...devices5,
    ]);
    await RTCMediaDeviceManager.instance()['_onMediaDevicesChange']();
    expect(RTCMediaDeviceManager.instance().setAudioInputDevice).toBeCalledWith(
      'b',
    );
    expect(RTCMediaDeviceManager.instance().getCurrentAudioInput()).toBe('b');
    expect(
      RTCMediaDeviceManager.instance().setAudioOutputDevice,
    ).toBeCalledWith('a');
    expect(RTCMediaDeviceManager.instance().getCurrentAudioOutput()).toBe('a');
  });

  it('should notify new device id when lazy timer 500ms reached. [JPT-1732]', done => {
    jest.useFakeTimers();
    RTCMediaDeviceManager.instance().destroy();
    jest.spyOn(RTCMediaDeviceManager.instance(), '_emitAudioInputChanged');
    jest.spyOn(RTCMediaDeviceManager.instance(), '_emitAudioOutputChanged');
    RTCMediaDeviceManager.instance().setAudioInputDevice('input');
    RTCMediaDeviceManager.instance().setAudioOutputDevice('output');
    jest.advanceTimersByTime(500);
    setImmediate(() => {
      expect(RTCMediaDeviceManager.instance().getCurrentAudioInput()).toBe(
        'input',
      );
      expect(RTCMediaDeviceManager.instance().getCurrentAudioOutput()).toBe(
        'output',
      );
      expect(
        RTCMediaDeviceManager.instance()._emitAudioInputChanged,
      ).toBeCalledWith('input');
      expect(
        RTCMediaDeviceManager.instance()._emitAudioOutputChanged,
      ).toBeCalledWith('output');
      done();
    });
  });
});
