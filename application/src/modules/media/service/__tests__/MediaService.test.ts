/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaService } from '../MediaService';
import * as utils from '@/store/utils';
import { mediaManager } from '../../MediaManager';
import { trackManager } from '../../TrackManager';
import { Media } from '../../Media';

describe('MediaService', () => {
  beforeEach(() => {
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');
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
  describe('getMedia()', () => {
    it('should get exist media', () => {
      const mediaId = 'testMediaId';
      const mediaService = new MediaService();
      const media = mediaService.createMedia({
        src: [],
        id: mediaId,
      });
      const checkMedia = mediaService.getMedia(mediaId);
      expect(checkMedia).toEqual(media);
    });
  });

  describe('canPlayType()', () => {
    it('should return this mime type can play', () => {
      const canPlayType = jest
        .spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'canPlayType')
        .mockReturnValue('maybe');
      mediaManager.canPlayType('audio/mp3');
      expect(canPlayType).toHaveBeenCalled();
    });
  });

  describe('setDuckVolume()', () => {
    it('should set duck volume to all track', () => {
      const mediaService = new MediaService();
      expect(trackManager.duckVolume).toEqual(1);

      mediaService.setDuckVolume(0.7);
      expect(trackManager.duckVolume).toEqual(0.7);
    })
  })
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
        .mockReturnValue({ id: '', isMocked: true, source: devices });
      const mediaService = new MediaService();
      expect(mediaService.allOutputDevices).toEqual(['device1', 'device2']);
    });
  });
});
