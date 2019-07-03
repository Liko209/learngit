/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Media } from '../Media';
import { trackManager } from '../TrackManager';
import { MediaTrack } from '../MediaTrack';
import { MediaEventType } from '@/interface/media';

const baseMediaOpts = {
  src: ['example.mp3'],
  id: 'baseId',
  trackId: 'useTrackId',
};

const useTrackOpts = {
  id: baseMediaOpts.trackId,
  mediaId: baseMediaOpts.id,
  src: baseMediaOpts.src,
  volume: 1,
  muted: false,
};

const noUseTrackOpts = {
  id: 'notUseTrackId',
  volume: 1,
  muted: false,
};

describe('Media', () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.load = jest.fn();

    window.HTMLMediaElement.prototype.play = jest.fn();

    jest
      .spyOn(trackManager, 'getTrack')
      .mockReturnValue(new MediaTrack(useTrackOpts));
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('should create media', () => {
    const media = new Media(baseMediaOpts);
    expect(media).toBeInstanceOf(Media);
  });
  describe('create media with options', () => {
    it('should setup default options', () => {
      const media = new Media(baseMediaOpts);
      expect(media.id).toEqual(baseMediaOpts.id);
      expect(media.src).toEqual(baseMediaOpts.src);
      expect(media.trackId).toEqual(baseMediaOpts.trackId);
      expect(media.volume).toEqual(1);
      expect(media.muted).toBeFalsy();
      expect(media.outputDevices).toEqual([]);
    });
    it('should set volume when setup volume', () => {
      const media1 = new Media(
        Object.assign({}, baseMediaOpts, {
          volume: 0.5,
        }),
      );
      expect(media1.volume).toEqual(0.5);
      const media2 = new Media(
        Object.assign({}, baseMediaOpts, {
          volume: 1.7,
        }),
      );
      expect(media2.volume).toEqual(1);
    });
    it('should set output device when setup outputDevices', () => {
      const outputDevices = ['device1', 'device2'];
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          outputDevices,
        }),
      );
      expect(media.outputDevices).toEqual(outputDevices);
    });
    it('should set all output device when setup outputDevice all', () => {
      const outputDevices = ['device1', 'device2', 'device3'];
      jest
        .spyOn(trackManager, 'getAllOutputDevicesId')
        .mockReturnValue(outputDevices);
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          outputDevices: 'all',
        }),
      );
      expect(media.outputDevices).toEqual(outputDevices);
    });
  });
  describe('media play', () => {
    it('should play media when current media is in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(useTrack.currentMediaId).toEqual(media.id);

      media.play();
      expect(useTrack.playing).toBeTruthy();
    });
    it('should play media and do nothing when media in track and track is playing now', () => {
      const currentTime = 100;
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);

      const media = new Media(baseMediaOpts);
      useTrack.setCurrentTime(currentTime, true);
      // when
      expect(useTrack.currentTime).toEqual(currentTime);
      expect(useTrack.currentMediaId).toEqual(media.id);

      media.play();
      // check
      expect(useTrack.playing).toBeTruthy();
      expect(media.playing).toBeTruthy();
      expect(useTrack.currentTime).toEqual(currentTime);
    });
    it('should play media by start time when play with start time options', () => {
      const startTime = 200;
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      useTrack.setCurrentTime(0, true);
      const media = new Media(baseMediaOpts);
      // when
      expect(useTrack.playing).toBeTruthy();

      media.play({ startTime });
      expect(useTrack.currentTime).toEqual(startTime);
      expect(useTrack.playing).toBeTruthy();
    });
    it('should play media when current media is not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(noUseTrack.id).toEqual(noUseTrackOpts.id);
      media.play();
      expect(noUseTrack.currentMediaId).toEqual(baseMediaOpts.id);
      expect(noUseTrack.playing).toBeTruthy();
    });
  });
  describe('media pause', () => {
    it('should pause media when current media is in track and playing', () => {
      const media = new Media(baseMediaOpts);
      media.play();
      expect(media.playing).toBeTruthy();

      media.pause();
      expect(media.pause).toBeTruthy();
      expect(media.playing).toBeFalsy();
    });
    it('should not pause when current media is not playing', () => {
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
      expect(() => media.pause()).toThrow();
    });
    it('should not pause when current media is not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
      expect(() => media.pause()).toThrow();
    });
  });
  describe('media stop', () => {
    it('should stop media when current media is in track and playing', () => {
      const media = new Media(baseMediaOpts);
      media.play();
      expect(media.playing).toBeTruthy();

      media.stop();
      expect(media.pause).toBeTruthy();
      expect(media.playing).toBeFalsy();
    });
    it('should stop when current media is not playing', () => {
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
      media.stop();
      expect(media.pause).toBeTruthy();
      expect(media.playing).toBeFalsy();
    });
    it('should not stop when current media is not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
      expect(() => media.stop()).toThrow();
    });
  });
  describe('media set mute', () => {
    it('should track and media set mute when media setMute called and media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(media.muted).toBeFalsy();
      expect(useTrack.muted).toBeFalsy();

      media.setMute(true);
      expect(media.muted).toBeTruthy();
      expect(useTrack.muted).toBeTruthy();
    });
    it('should media set mute and track not set mute when media setMute called and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.muted).toBeFalsy();
      expect(noUseTrack.muted).toBeFalsy();

      media.setMute(true);
      expect(media.muted).toBeTruthy();
      expect(noUseTrack.muted).toBeFalsy();
    });
  });
  describe('media set volume', () => {
    it('should track and media set volume when media setVolume called and media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(media.volume).toEqual(1);
      expect(useTrack.volume).toEqual(1);

      media.setVolume(0.5);
      expect(media.volume).toEqual(0.5);
      expect(useTrack.volume).toEqual(0.5);
    });
    it('should media set volume and track not set volume when media setVolume called and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.volume).toEqual(1);
      expect(noUseTrack.volume).toEqual(1);

      media.setVolume(0.5);
      expect(media.volume).toEqual(0.5);
      expect(noUseTrack.volume).toEqual(1);
    });
  });
  describe('media set output devices', () => {
    it('should set output device when media setOutputDevices called and media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);

      const devices = ['device1', 'device2'];
      const media = new Media(baseMediaOpts);
      media.setOutputDevices(devices);
      expect(media.outputDevices).toEqual(devices);
      expect(useTrack.outputDevices).toEqual(devices);
    });
    it('should set all output device when media setOutputDevices all called and media in track', () => {
      const allDevices = ['device1', 'device2', 'device3'];
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      jest
        .spyOn(trackManager, 'getAllOutputDevicesId')
        .mockReturnValue(allDevices);

      const media = new Media(baseMediaOpts);
      media.setOutputDevices('all');
      expect(media.outputDevices).toEqual(allDevices);
      expect(useTrack.outputDevices).toEqual(allDevices);
    });
    it('should set output device when media setOutputDevices called and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);

      const devices = ['device1', 'device2'];
      const media = new Media(baseMediaOpts);
      media.setOutputDevices(devices);
      expect(media.outputDevices).toEqual(devices);
      expect(noUseTrack.outputDevices).toEqual([]);
    });
    it('should set all output device when media setOutputDevices all called and media not in track', () => {
      const allDevices = ['device1', 'device2', 'device3'];
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      jest
        .spyOn(trackManager, 'getAllOutputDevicesId')
        .mockReturnValue(allDevices);

      const media = new Media(baseMediaOpts);
      media.setOutputDevices('all');
      expect(media.outputDevices).toEqual(allDevices);
      expect(noUseTrack.outputDevices).toEqual([]);
    });
  });
  describe('media on event', () => {
    it('should store event when media on called', () => {
      const loadedEvent = {
        name: 'loadeddata',
        type: MediaEventType.ON,
        handler: () => {},
      };
      const playEvent = {
        name: 'play',
        type: MediaEventType.ON,
        handler: () => {},
      };

      const media = new Media(baseMediaOpts);
      media.on('loadeddata', loadedEvent.handler);
      media.on('play', playEvent.handler);

      expect(media.events).toEqual([loadedEvent, playEvent]);
    });
  });
  describe('media off event', () => {
    it('should store event when media off called', () => {
      const loadedEvent = {
        name: 'loadeddata',
        type: MediaEventType.OFF,
        handler: () => {},
      };
      const playEvent = {
        name: 'play',
        type: MediaEventType.OFF,
        handler: () => {},
      };

      const media = new Media(baseMediaOpts);
      media.off('loadeddata', loadedEvent.handler);
      media.off('play', playEvent.handler);

      expect(media.events).toEqual([loadedEvent, playEvent]);
    });
  });
});
