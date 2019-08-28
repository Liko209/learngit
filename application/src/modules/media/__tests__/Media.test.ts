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
  loop: false,
  autoplay: false,
};

const noUseTrackOpts = {
  id: 'notUseTrackId',
  volume: 1,
  muted: false,
  loop: false,
  autoplay: false,
};

describe('Media', () => {
  beforeEach(() => {
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');

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
  it('should catch error when not track', () => {
    jest.spyOn(trackManager, 'getTrack').mockReturnValue(null);
    expect(() => new Media(baseMediaOpts)).toThrowError();
  });
  describe('create media with options', () => {
    it('should setup default options', () => {
      const media = new Media(baseMediaOpts);
      expect(media.id).toEqual(baseMediaOpts.id);
      expect(media.src).toEqual(baseMediaOpts.src);
      expect(media.trackId).toEqual(baseMediaOpts.trackId);
      expect(media.volume).toEqual(1);
      expect(media.muted).toBeFalsy();
      expect(media.loop).toBeFalsy();
      expect(media.outputDevices).toEqual(null);
    });
    it('should set loop when setup loop', () => {
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          loop: true,
        }),
      );
      expect(media.loop).toBeTruthy();
    });
    it('should set autoplay when setup autoplay', () => {
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          autoplay: true,
        }),
      );
      expect(media.autoplay).toBeTruthy();
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
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
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
    it('should play media by start time when media in track and play with start time options', () => {
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
    it('should play media by start time when media is track and play with start time options and track not playing now', () => {
      const startTime = 200;
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      useTrack.setCurrentTime(0, false);
      const media = new Media(baseMediaOpts);
      // when
      expect(useTrack.playing).toBeFalsy();

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
    it('should catch error when play with empty source', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media({
        src: [],
        id: 'baseId',
        trackId: 'useTrackId',
      });
      expect(useTrack.currentMediaId).toEqual(media.id);
      expect(() => {
        media.play()
      }).toThrowError();
    })
  });
  describe('media loop play', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
    it('should loop play media when media play and media in track', () => {
      const useTrack = new MediaTrack(
        Object.assign({}, useTrackOpts, {
          loop: true,
        }),
      );
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          loop: true,
        }),
      );
      expect(useTrack.currentMediaId).toEqual(media.id);

      media.play();
      expect(useTrack.playing).toBeTruthy();
      expect(media.playing).toBeTruthy();

      expect(media.loop).toBeTruthy();
      expect(useTrack.loop).toBeTruthy();
    });
    it('should loop play media when media play and media not in track', () => {
      const noUseTrack = new MediaTrack(
        Object.assign({}, noUseTrackOpts, {
          autoplay: true,
        }),
      );
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          autoplay: true,
        }),
      );
      expect(noUseTrack.currentMediaId).toEqual(media.id);

      media.play();
      expect(noUseTrack.playing).toBeTruthy();
      expect(noUseTrack.autoplay).toBeTruthy();

      expect(media.autoplay).toBeTruthy();
      expect(media.playing).toBeTruthy();
    });
  });
  describe('media auto play', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
    it('should auto play media when media setup and media in track', () => {
      const useTrack = new MediaTrack(
        Object.assign({}, useTrackOpts, {
          autoplay: true,
        }),
      );
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          autoplay: true,
        }),
      );

      expect(useTrack.currentMediaId).toEqual(media.id);
      expect(useTrack.playing).toBeTruthy();
      expect(useTrack.autoplay).toBeTruthy();

      expect(media.autoplay).toBeTruthy();
      expect(media.playing).toBeTruthy();
    });
    it('should auto play media when media setup and media not in track', () => {
      const noUseTrack = new MediaTrack(
        Object.assign({}, noUseTrackOpts, {
          autoplay: true,
        }),
      );
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(
        Object.assign({}, baseMediaOpts, {
          autoplay: true,
        }),
      );
      expect(noUseTrack.currentMediaId).toEqual(media.id);
      expect(noUseTrack.playing).toBeTruthy();
      expect(noUseTrack.autoplay).toBeTruthy();

      expect(media.autoplay).toBeTruthy();
      expect(media.playing).toBeTruthy();
    });
  });
  describe('media pause', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
    it('should pause media when current media is in track and playing', () => {
      const media = new Media(baseMediaOpts);
      media.play();
      expect(media.playing).toBeTruthy();

      media.pause();
      expect(media.playing).toBeFalsy();
    });
    it('should not pause when current media is not playing', () => {
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
    });
    it('should not pause when current media is not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
    });
  });
  describe('media stop', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
    it('should stop media when current media is in track and playing', () => {
      const media = new Media(baseMediaOpts);
      media.play();
      expect(media.playing).toBeTruthy();

      media.stop();
      expect(media.pause).toBeTruthy();
      expect(media.playing).toBeFalsy();
      expect(media.currentTime).toEqual(0);
    });
    it('should stop when current media is not playing', () => {
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
      media.stop();
      expect(media.pause).toBeTruthy();
      expect(media.playing).toBeFalsy();
      expect(media.currentTime).toEqual(0);
    });
    it('should not stop when current media is not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.playing).toBeFalsy();
      expect(media.currentTime).toEqual(0);
    });
  });
  describe('media set src', () => {
    it('should dispose track and reset media when media setSrc called', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      media.play();
      expect(media.src).toEqual(baseMediaOpts.src);
      expect(media.play).toBeTruthy();

      const newSrc = 'newSrc.mp3';
      media.setSrc(newSrc);
      expect(media.src).toEqual(newSrc);
      expect(media.playing).toBeFalsy();
      expect(media.currentTime).toEqual(0);
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
      expect(useTrack.currentMediaVolume).toEqual(1);

      media.setVolume(0.5);
      expect(media.volume).toEqual(0.5);
      expect(useTrack.currentMediaVolume).toEqual(0.5);
    });
    it('should media set volume and track not set volume when media setVolume called and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.volume).toEqual(1);
      expect(noUseTrack.currentMediaVolume).toEqual(1);

      media.setVolume(0.5);
      expect(media.volume).toEqual(0.5);
      expect(noUseTrack.currentMediaVolume).toEqual(1);
    });
  });
  describe('media set loop', () => {
    it('should track and media start loop when media setLoop true and media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(media.loop).toEqual(false);
      expect(useTrack.loop).toEqual(false);

      media.setLoop(true);
      expect(media.loop).toBeTruthy();
      expect(useTrack.loop).toBeTruthy();
    });
    it('should track and media stop loop when media setLoop false and media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);

      media.setLoop(true);
      expect(media.loop).toBeTruthy();
      expect(useTrack.loop).toBeTruthy();

      media.setLoop(false);
      expect(media.loop).toBeFalsy();
      expect(useTrack.loop).toBeFalsy();
    });
    it('should media set loop and track not set loop when media setLoop and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(media.loop).toEqual(false);
      expect(noUseTrack.loop).toEqual(false);

      media.setLoop(true);
      expect(media.loop).toBeTruthy();
      expect(noUseTrack.loop).toBeFalsy();
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
    it('should set none output device when media setOutputDevices null called and media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);

      const media = new Media(baseMediaOpts);
      media.setOutputDevices(null);
      expect(media.outputDevices).toEqual(null);
      expect(useTrack.outputDevices).toEqual(null);
    });
    it('should set output device when media setOutputDevices called and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);

      const devices = ['device1', 'device2'];
      const media = new Media(baseMediaOpts);
      media.setOutputDevices(devices);
      expect(media.outputDevices).toEqual(devices);
      expect(noUseTrack.outputDevices).toEqual(null);
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
      expect(noUseTrack.outputDevices).toEqual(null);
    });
    it('should set none output device when media setOutputDevices null called and media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);

      const media = new Media(baseMediaOpts);
      media.setOutputDevices(null);
      expect(media.outputDevices).toEqual(null);
      expect(noUseTrack.outputDevices).toEqual(null);
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
    it('should store event when media on called and media in track', () => {
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

      const useTrack = new MediaTrack(useTrackOpts);
      const bindFn = jest.spyOn(useTrack, 'bindEvent');
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      media.on('loadeddata', loadedEvent.handler);
      media.on('play', playEvent.handler);

      expect(media.events).toEqual([loadedEvent, playEvent]);
      expect(bindFn).toHaveBeenCalledTimes(2);
    });
    it('should store event when media on called and media in track', () => {
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

      const useTrack = new MediaTrack(useTrackOpts);
      const bindFn = jest.spyOn(useTrack, 'bindEvent');
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      media.on('loadeddata', loadedEvent.handler);
      media.on('play', playEvent.handler);

      expect(media.events).toEqual([loadedEvent, playEvent]);
      expect(bindFn).toHaveBeenCalledTimes(2);
    });
    it('should store event when media on called and media in track', () => {
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

      const useTrack = new MediaTrack(useTrackOpts);
      const bindFn = jest.spyOn(useTrack, 'bindEvent');
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      media.on('loadeddata', loadedEvent.handler);
      media.on('play', playEvent.handler);

      expect(media.events).toEqual([loadedEvent, playEvent]);
      expect(bindFn).toHaveBeenCalledTimes(2);
    });
  });
  describe('media off event', () => {
    it('should remove store event when media off called', () => {
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

      media.off('loadeddata', loadedEvent.handler);
      expect(media.events).toEqual([playEvent]);
    });
    it('should execute event when media off called and media in track', () => {
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

      const useTrack = new MediaTrack(useTrackOpts);
      const unbindFn = jest.spyOn(useTrack, 'unbindEvent');
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);

      media.off('loadeddata', loadedEvent.handler);
      media.off('play', playEvent.handler);
      expect(unbindFn).toHaveBeenCalledTimes(2);
    });
  });
  describe('media dispose', () => {
    it('should dispose media when media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(useTrack.currentMediaId).toEqual(media.id);

      media.dispose();
      expect(useTrack.currentMediaId).toEqual('');
      expect(useTrack.sounds.length).toEqual(0);
      expect(media.currentTime).toEqual(0);
    });
    it('should call onReset when media bind onReset event', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(useTrack.currentMediaId).toEqual(media.id);

      const onResetMockFun1 = jest.fn();
      const onResetMockFun2 = jest.fn();
      media.onReset(() => {
        onResetMockFun1();
      })
      media.onReset(() => {
        onResetMockFun2();
      })

      media.dispose();
      expect(onResetMockFun1).toBeCalled();
      expect(onResetMockFun2).toBeCalled();
    })
    it('should call onDisposed when media bind onDisposed event', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(useTrack.currentMediaId).toEqual(media.id);

      const onDisposedMockFun = jest.fn();
      media.onDisposed(() => {
        onDisposedMockFun();
      })

      media.dispose();
      expect(onDisposedMockFun).toBeCalled();
    })
  });
  describe('get current time', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
    it('should return track current time when media in track', () => {
      const currentTime = 100;
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      media.setCurrentTime(currentTime);
      expect(useTrack.currentMediaId).toEqual(media.id);
      expect(useTrack.currentTime).toEqual(currentTime);

      media.play();
      expect(useTrack.playing).toBeTruthy();
      expect(media.currentTime).toEqual(useTrack.currentTime);
    });
    it('should return media current time when media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(noUseTrack.id).toEqual(noUseTrackOpts.id);
      media.play();
      expect(noUseTrack.currentMediaId).toEqual(baseMediaOpts.id);
      expect(noUseTrack.playing).toBeTruthy();
      expect(media.currentTime).toEqual(0);
    });
    it('should return zero when media is out of track', () => {
      const currentTime = 200;
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);

      const media = new Media(baseMediaOpts);
      expect(noUseTrack.id).toEqual(noUseTrackOpts.id);
      media.play();
      media.setCurrentTime(currentTime);
      expect(noUseTrack.currentMediaId).toEqual(media.id);
      expect(media.currentTime).toEqual(currentTime);

      const newMediaId = 'newMediaId';
      const newMedia = new Media(
        Object.assign({}, baseMediaOpts, {
          id: newMediaId,
        }),
      );
      newMedia.play();
      expect(noUseTrack.currentMediaId).toEqual(newMedia.id);
      expect(media.currentTime).toEqual(0);
    });
  });
  describe('get duration', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });
    it('should return duration when media in track', () => {
      const useTrack = new MediaTrack(useTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(useTrack);
      const media = new Media(baseMediaOpts);
      expect(useTrack.currentMediaId).toEqual(media.id);
      expect(media.duration).toEqual(useTrack.currentMediaDuration);
    });
    it('should return zero when media not in track', () => {
      const noUseTrack = new MediaTrack(noUseTrackOpts);
      jest.spyOn(trackManager, 'getTrack').mockReturnValue(noUseTrack);
      const media = new Media(baseMediaOpts);
      expect(noUseTrack.id).toEqual(noUseTrackOpts.id);
      expect(media.duration).toEqual(0);
    });
  });
});
