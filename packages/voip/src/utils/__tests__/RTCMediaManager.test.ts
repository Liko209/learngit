/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-03-13 10:58:25
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCMediaElementManager } from '../RTCMediaElementManager';

describe('RTCMediaElementManager', () => {
  it('should do nothing when set volume value out of [0, 1]. [JPT-1279]', () => {
    expect(RTCMediaElementManager.instance().getVolume()).toBe(1);
    RTCMediaElementManager.instance().setVolume(2);
    expect(RTCMediaElementManager.instance().getVolume()).toBe(1);
  });

  it('should save volume value in memory when set volume value in [0, 1]. [JPT-1280]', () => {
    RTCMediaElementManager.instance().destroy();
    expect(RTCMediaElementManager.instance().getVolume()).toBe(1);
    RTCMediaElementManager.instance().setVolume(0.5);
    expect(RTCMediaElementManager.instance().getVolume()).toBe(0.5);
  });

  it('should default volume = 1 when engine start. [JPT-1281]', () => {
    RTCMediaElementManager.instance().destroy();
    expect(RTCMediaElementManager.instance().getVolume()).toBe(1);
  });

  it("should not set volume in element when there's no video element. [JPT-1283]", () => {
    RTCMediaElementManager.instance().destroy();
    jest.spyOn(RTCMediaElementManager.instance(), '_setVolumeInVideoElement');
    expect(RTCMediaElementManager.instance().getVolume()).toBe(1);
    RTCMediaElementManager.instance().setVolume(0.5);
    expect(
      RTCMediaElementManager.instance()._setVolumeInVideoElement,
    ).not.toBeCalled();
  });

  it("should set volume in element when there's video element. [JPT-1284]", () => {
    document.body.innerHTML = '<div><video class="rc-phone-audio"></div>';

    RTCMediaElementManager.instance().destroy();
    jest.spyOn(RTCMediaElementManager.instance(), '_setVolumeInVideoElement');
    expect(RTCMediaElementManager.instance().getVolume()).toBe(1);
    RTCMediaElementManager.instance().setVolume(0.5);
    expect(
      RTCMediaElementManager.instance()._setVolumeInVideoElement,
    ).toBeCalled();
  });
});
