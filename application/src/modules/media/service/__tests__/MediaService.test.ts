/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaService } from '../MediaService';
import * as utils from '@/store/utils';
import { mediaManager } from '../../MediaManager';
import { Media } from '../../Media';

describe('MediaService', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      get() {
        return () => {};
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      configurable: true,
      get() {
        return () => {};
      },
    });
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('createMedia()', () => {
    it('should create mediaTrack', () => {
      const media = new MediaService().createMedia({
        src: [],
      });
      expect(media).toBeInstanceOf(Media);
    });
  });
  describe('canPlayType()', () => {
    it('should return this mime type can play', () => {
      const mockFunc = jest.fn();
      Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
        configurable: true,
        get() {
          mockFunc();
          return true;
        },
      });
      mediaManager.canPlayType('audio/mp3');
      expect(mockFunc).toBeCalled();
    });
  });
  describe('globalVolume', () => {
    it('should get global volume', () => {
      jest
        .spyOn(utils, 'getEntity')
        .mockReturnValue({ id: '', isMocked: true, value: 1 });
      const mediaService = new MediaService();
      expect(mediaService.globalVolume).toEqual(1);
    });
  });
  describe('outputDevice', () => {
    it('should get output device', () => {
      const devices = [
        {
          deviceId: 'device1',
          label: 'device1',
        },
        {
          deviceId: 'device2',
          label: 'device2',
        },
        {
          deviceId: 'default',
          label: 'default',
        },
        {
          deviceId: 'VirtualDevice',
          label: 'VirtualDevice',
        },
      ];
      jest
        .spyOn(utils, 'getEntity')
        .mockReturnValue({ id: '', isMocked: true, value: devices });
      const mediaService = new MediaService();
      expect(mediaService.outputDevices).toEqual(['device1', 'device2']);
    });
  });
});
