/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-28 9:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaTrack } from '../MediaTrack';
import { MediaEventType, MediaEventName } from '@/interface/media';

const trackBaseOpts = {
  id: 'testTrackId',
  volume: 1,
  muted: false,
};

const withoutMediaOpts = {
  mediaId: '',
  src: '',
};

const hasMediaOpts = {
  mediaId: 'testMediaId',
  src: ['testMediaSrc.mp3'],
  currentTime: 0,
  mediaEvents: [],
};

describe('MediaTrack', () => {
  beforeEach(() => {
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');
    jest
      .spyOn<HTMLAudioElement, any>(
        HTMLMediaElement.prototype,
        'readyState',
        'get',
      )
      .mockReturnValue('5');
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create track', () => {
    const mediaTrack = new MediaTrack(trackBaseOpts);
    expect(mediaTrack).toBeInstanceOf(MediaTrack);
  });
  describe('constructor()', () => {
    describe('create media track without media', () => {
      it('should create default media track by id', () => {
        const mediaTrack = new MediaTrack(trackBaseOpts);
        expect(mediaTrack.id).toEqual(trackBaseOpts.id);
        expect(mediaTrack.currentMediaId).toEqual(withoutMediaOpts.mediaId);
        expect(mediaTrack.src).toEqual([]);
        expect(mediaTrack.volume).toEqual(1);
        expect(mediaTrack.muted).toBeFalsy();
        expect(mediaTrack.loop).toBeFalsy();
        expect(mediaTrack.autoplay).toBeFalsy();
        expect(mediaTrack.currentTime).toEqual(0);
        expect(mediaTrack.outputDevices).toEqual(null);
        expect(mediaTrack.masterVolume).toEqual(1);
        expect(mediaTrack.currentMediaEvent).toEqual([]);
        expect(mediaTrack.currentMediaUrl).toEqual('');
        expect(mediaTrack.currentMediaVolume).toEqual(1);
        expect(mediaTrack.weight).toEqual(9999);
      });
      it('should create media track use custom options', () => {
        const mediaTrack = new MediaTrack(
          Object.assign({}, trackBaseOpts, withoutMediaOpts),
        );
        expect(mediaTrack.currentMediaId).toEqual(withoutMediaOpts.mediaId);
        expect(mediaTrack.src).toEqual([]);
      });
    });
    describe('create media track with media', () => {
      it('should create media track use custom options', () => {
        const mediaTrack = new MediaTrack(
          Object.assign({}, trackBaseOpts, hasMediaOpts),
        );
        expect(mediaTrack.src).toEqual(hasMediaOpts.src);
        expect(mediaTrack.currentMediaId).toEqual(hasMediaOpts.mediaId);
        expect(mediaTrack.currentMediaUrl).toEqual(hasMediaOpts.src[0]);
        expect(mediaTrack.currentMediaEvent).toEqual([]);
        expect(mediaTrack.sounds.length).toEqual(1);
      });
      it('should set valid volume when custom set inValid volume', () => {
        const mediaTrack1 = new MediaTrack(
          Object.assign({}, trackBaseOpts, hasMediaOpts, {
            volume: 10,
          }),
        );
        expect(mediaTrack1.volume).toEqual(1);
        const mediaTrack2 = new MediaTrack(
          Object.assign({}, trackBaseOpts, hasMediaOpts, {
            volume: -0.1,
          }),
        );
        expect(mediaTrack2.volume).toEqual(1);
      });
      it('should set master volume when custom set global volume', () => {
        const testVol = 0.52;
        const mediaTrack = new MediaTrack(
          Object.assign({}, trackBaseOpts, hasMediaOpts, {
            masterVolume: testVol,
          }),
        );
        expect(mediaTrack.masterVolume).toEqual(testVol);
      });
      it('should set media volume when custom set media volume', () => {
        const testVol = 0.52;
        const mediaTrack = new MediaTrack({
          ...trackBaseOpts,
          ...hasMediaOpts,
          mediaVolume: testVol,
        });
        expect(mediaTrack.currentMediaVolume).toEqual(testVol);
      });
      it('should set output device when custom set output devices', () => {
        const devices = ['device1', 'device2'];
        const mediaTrack = new MediaTrack(
          Object.assign({}, trackBaseOpts, hasMediaOpts, {
            outputDevices: devices,
          }),
        );
        expect(mediaTrack.outputDevices).toEqual(devices);
        expect(mediaTrack.sounds.length).toEqual(2);
      });
      it('should set media event when custom set event', () => {
        const loadEvent = {
          type: 'load',
          name: 'on',
          handler: () => {},
        };
        const mediaTrack = new MediaTrack(
          Object.assign({}, trackBaseOpts, hasMediaOpts, {
            mediaEvents: [loadEvent],
          }),
        );
        expect(mediaTrack.currentMediaEvent).toEqual([loadEvent]);
      });
      it('should set media track weight when custom set weight', () => {
        const testWeight = 100;
        const mediaTrack = new MediaTrack({
          ...trackBaseOpts,
          ...hasMediaOpts,
          weight: testWeight,
        });
        expect(mediaTrack.weight).toEqual(testWeight);
      });
    });
  });

  describe('play()', () => {
    it('should play sound when play called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      expect(mediaTrack.currentMediaUrl).toEqual(hasMediaOpts.src[0]);
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
    });
    it('should throw err when track not have media', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, withoutMediaOpts),
      );
      expect(() => mediaTrack.play()).toThrow();
    });
  });

  describe('pause()', () => {
    it('should pause sound when track pause called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
      mediaTrack.pause();
      expect(mediaTrack.playing).toBeFalsy();
    });
  });

  describe('stop()', () => {
    it('should stop sound when track stop called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
      mediaTrack.stop();
      expect(mediaTrack.playing).toBeFalsy();
      expect(mediaTrack.currentTime).toEqual(0);
    });
  });

  describe('setMute()', () => {
    it('should set sound mute or unmute when track setMute called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setMute(false);
      expect(mediaTrack.muted).toBeFalsy();
      mediaTrack.setMute(true);
      expect(mediaTrack.muted).toBeTruthy();
    });
  });

  describe('setVolume()', () => {
    it('should set sound volume when track setVolume called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setVolume(0.1);
      expect(mediaTrack.volume).toEqual(0.1);
    });
    it('should not set sound volume when volume is inValid', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setVolume(0.1);
      expect(mediaTrack.volume).toEqual(0.1);
      mediaTrack.setVolume(1.5);
      expect(mediaTrack.volume).toEqual(0.1);
    });
  });

  describe('setLoop()', () => {
    it('should set sound loop when track setLoop called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setLoop(false);
      expect(mediaTrack.loop).toBeFalsy();
      mediaTrack.setLoop(true);
      expect(mediaTrack.loop).toBeTruthy();
    });
  });

  describe('setCurrentTime()', () => {
    it('should throw error when media not have url but set continue play', () => {
      const currentTime = 100;
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, withoutMediaOpts),
      );
      expect(() => {
        mediaTrack.setCurrentTime(currentTime, true);
      }).toThrow();
    });
    it('should set sound current time when track setVolume called', () => {
      const currentTime = 100;
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setCurrentTime(currentTime);
      expect(mediaTrack.currentTime).toEqual(currentTime);
      expect(mediaTrack.playing).toBeTruthy();
    });
    it('should not continue play when set continue false', () => {
      const currentTime = 200;
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
      mediaTrack.setCurrentTime(currentTime, false);
      expect(mediaTrack.currentTime).toEqual(currentTime);
      expect(mediaTrack.playing).toBeFalsy();
    });
  });

  describe('setOutputDevices()', () => {
    it('should not chang device when devices is not change', () => {
      const devices = ['device1', 'device2'];
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          outputDevices: devices,
        }),
      );
      mediaTrack.setOutputDevices(devices);
      expect(mediaTrack.outputDevices).toEqual(devices);
      expect(mediaTrack.sounds.length).toEqual(2);
    });
    it('should create device sound when track have output devices', () => {
      const devices = ['device1', 'device2'];
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          outputDevices: devices,
        }),
      );
      expect(mediaTrack.outputDevices).toEqual(devices);
      expect(mediaTrack.sounds.length).toEqual(2);
    });
    it('should initial device sound when track no device before', () => {
      const devices = ['device1', 'device2'];
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      expect(mediaTrack.outputDevices).toEqual(null);

      mediaTrack.setOutputDevices(devices);
      expect(mediaTrack.outputDevices).toEqual(devices);
      expect(mediaTrack.sounds.length).toEqual(2);
      expect(mediaTrack.sounds[0].id.includes(devices[0])).toBeTruthy();
    });
    it('should change devices sound when track have device before', () => {
      const oldDevices = ['device1', 'device2', 'device3'];
      const newDevices = ['device2', 'device3', 'device4', 'device5'];
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          outputDevices: oldDevices,
        }),
      );
      expect(mediaTrack.outputDevices).toEqual(oldDevices);

      mediaTrack.setOutputDevices(newDevices);
      expect(mediaTrack.outputDevices).toEqual(newDevices);
      expect(mediaTrack.sounds.length).toEqual(4);
    });
    it('should continue play sound when track set output device', () => {
      const oldDevices = ['device1', 'device2', 'device3'];
      const newDevices = ['device2', 'device3', 'device4', 'device5'];

      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          outputDevices: oldDevices,
        }),
      );
      expect(mediaTrack.playing).toBeFalsy();
      mediaTrack.setOutputDevices(newDevices);
      expect(mediaTrack.sounds.length).toEqual(4);
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
      mediaTrack.setOutputDevices(oldDevices);
      expect(mediaTrack.playing).toBeTruthy();
      expect(mediaTrack.sounds.length).toEqual(3);
    });
    it('should remove all device sound and create normal sound when set output device null', () => {
      const devices = ['device1', 'device2', 'device3'];
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          outputDevices: devices,
        }),
      );
      expect(mediaTrack.sounds.length).toEqual(3);
      mediaTrack.setOutputDevices(null);
      expect(mediaTrack.sounds.length).toEqual(1);
    });
    it('should continue play sound when track set output device null', () => {
      const devices = ['device1', 'device2', 'device3'];
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          outputDevices: devices,
        }),
      );
      expect(mediaTrack.playing).toBeFalsy();
      expect(mediaTrack.sounds.length).toEqual(3);
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
      mediaTrack.setOutputDevices(null);
      expect(mediaTrack.sounds.length).toEqual(1);
      expect(mediaTrack.playing).toBeTruthy();
    });
  });

  describe('setMasterVolume()', () => {
    it('should set sound volume when track setMasterVolume called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setMasterVolume(0.5);
      expect(mediaTrack.masterVolume).toEqual(0.5);
    });
    it('should not set sound volume when master volume is inValid', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setMasterVolume(0.5);
      expect(mediaTrack.masterVolume).toEqual(0.5);
      mediaTrack.setMasterVolume(2);
      expect(mediaTrack.masterVolume).toEqual(0.5);
    });
  });

  describe('setDuckVolume()', () => {
    it('should set sound volume when track setDuckVolume called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setDuckVolume(0.5);
      expect(mediaTrack.duckVolume).toEqual(0.5);
    });
    it('should not set sound volume when duck volume is inValid', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setDuckVolume(0.5);
      expect(mediaTrack.duckVolume).toEqual(0.5);
      mediaTrack.setDuckVolume(2);
      expect(mediaTrack.duckVolume).toEqual(0.5);
    });
  });

  describe('setMediaVolume()', () => {
    it('should set sound volume when track set media volume', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setMediaVolume(0.1);
      expect(mediaTrack.volume).toEqual(1);
      expect(mediaTrack.masterVolume).toEqual(1);
      expect(mediaTrack.currentMediaVolume).toEqual(0.1);
      expect(mediaTrack.sounds[0].volume).toEqual(0.1);
    });
    it('should not set sound volume when media volume is inValid', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.setMediaVolume(0.5);
      expect(mediaTrack.currentMediaVolume).toEqual(0.5);
      mediaTrack.setMediaVolume(2);
      expect(mediaTrack.currentMediaVolume).toEqual(0.5);
    });
  });

  describe('setOptions()', () => {
    it('should setup new media when track setOptions called', () => {
      const newMediaInfo = {
        id: trackBaseOpts.id,
        mediaId: 'newMediaId',
        src: ['newMediaId.mp3'],
      };
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      expect(mediaTrack.currentMediaId).toEqual(hasMediaOpts.mediaId);
      mediaTrack.setOptions(newMediaInfo);
      expect(mediaTrack.id).toEqual(newMediaInfo.id);
      expect(mediaTrack.currentMediaId).toEqual(newMediaInfo.mediaId);
      expect(mediaTrack.src).toEqual(newMediaInfo.src);
    });
    it('should not change the master volume when setOptions argument not masterVolume', () => {
      const newMediaInfo = {
        id: trackBaseOpts.id,
        mediaId: 'newMediaId',
        src: ['newMediaId.mp3'],
      };
      const masterVolume = 0.51;
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          masterVolume,
        }),
      );
      expect(mediaTrack.masterVolume).toEqual(masterVolume);

      mediaTrack.setOptions(newMediaInfo);
      expect(mediaTrack.id).toEqual(newMediaInfo.id);
      expect(mediaTrack.masterVolume).toEqual(masterVolume);
    });
  });

  describe('dispose()', () => {
    it('should reset track when dispose called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      expect(mediaTrack.sounds.length).toEqual(1);
      mediaTrack.dispose();
      expect(mediaTrack.sounds.length).toEqual(0);
      expect(mediaTrack.currentMediaId).toEqual('');
      expect(mediaTrack.currentMediaUrl).toEqual('');
      expect(mediaTrack.currentMediaEvent).toEqual([]);
      expect(mediaTrack.src).toEqual([]);
      expect(mediaTrack.muted).toBeFalsy();
      expect(mediaTrack.volume).toEqual(1);
      expect(mediaTrack.currentTime).toEqual(0);
      expect(mediaTrack.outputDevices).toEqual([]);
    });
  });

  describe('bindEvent()', () => {
    it('should bind event to current media', () => {
      const loadedEvent = {
        name: 'loadeddata' as MediaEventName,
        type: MediaEventType.ON,
        handler: () => {},
      };
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          mediaEvents: [],
        }),
      );
      expect(mediaTrack.currentMediaId).toEqual(hasMediaOpts.mediaId);
      expect(mediaTrack.currentMediaEvent.length).toEqual(0);

      mediaTrack.bindEvent(loadedEvent.name, loadedEvent.handler);
      expect(mediaTrack.currentMediaEvent.length).toEqual(1);
      expect(mediaTrack.currentMediaEvent[0].name).toEqual(loadedEvent.name);

      const sound = mediaTrack.sounds[0];
      const bindFn = jest.spyOn(sound, 'bindEvent');
      mediaTrack.bindEvent(loadedEvent.name, loadedEvent.handler);
      expect(bindFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('unbindEvent()', () => {
    it('should unbind event to current media', () => {
      const loadedEvent = {
        name: 'loadeddata' as MediaEventName,
        type: MediaEventType.OFF,
        handler: () => {},
      };
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts, {
          mediaEvents: [],
        }),
      );
      expect(mediaTrack.currentMediaId).toEqual(hasMediaOpts.mediaId);
      mediaTrack.bindEvent(loadedEvent.name, loadedEvent.handler);
      expect(mediaTrack.currentMediaEvent.length).toEqual(1);
      expect(mediaTrack.currentMediaEvent[0].name).toEqual(loadedEvent.name);

      const sound = mediaTrack.sounds[0];
      const unbindFn = jest.spyOn(sound, 'unbindEvent');
      mediaTrack.unbindEvent(loadedEvent.name, loadedEvent.handler);
      expect(unbindFn).toHaveBeenCalled();
    });
  });

  describe('onPlaying()', () => {
    it('should emit onPlaying event', () => {
      const mediaTrack = new MediaTrack({
        ...trackBaseOpts,
        ...hasMediaOpts,
      });
      const playingMockFn = jest.fn();
      const noPlayingMockFn = jest.fn();

      mediaTrack.onPlaying((isPlaying: boolean) => {
        isPlaying ? playingMockFn() : noPlayingMockFn();
      });

      mediaTrack._trackPlayingEvent();
      expect(playingMockFn).toHaveBeenCalled();
      mediaTrack._trackNoPlayingEvent();
      expect(noPlayingMockFn).toHaveBeenCalled();
    });
    it('should emit onPlaying event when track reset', () => {
      const mediaTrack = new MediaTrack({
        ...trackBaseOpts,
        ...hasMediaOpts,
      });

      const playingMockFn = jest.fn();
      mediaTrack.onPlaying(playingMockFn);

      mediaTrack._resetTrack();
      expect(playingMockFn).toHaveBeenCalled();
    });
  });
});
