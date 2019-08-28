/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 13:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Sound } from '../Sound';
import { MediaEventName, MediaEventType } from '@/interface/media';

const soundBaseOpts = {
  id: 'testId',
  url: 'testUrl',
  muted: false,
  volume: 1,
  loop: false,
  autoplay: false,
  seek: 0,
};

describe('Sound', () => {
  beforeEach(() => {
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create sound', () => {
    const sound = new Sound(soundBaseOpts);
    expect(sound).toBeInstanceOf(Sound);
  });

  describe('create sound', () => {
    it('should create audio element for sound', () => {
      const sound = new Sound(soundBaseOpts);
      expect(sound.node).toBeInstanceOf(HTMLMediaElement);
    });
    it('should reset state when audio error', () => {
      const sound = new Sound(soundBaseOpts);
      sound.node.dispatchEvent(new Event('error'));
      expect(sound.paused).toBeTruthy();
      expect(sound.ended).toBeTruthy();
    });
    it('should update duration when audio canplay', () => {
      const sound = new Sound(soundBaseOpts);
      jest.spyOn(sound.node, 'duration', 'get').mockReturnValue(10.123);
      sound.node.dispatchEvent(new Event('canplay'));
      expect(sound.duration).toBe(10.123);
    });
    it('should set _hasSinkId to true when setSinkId success', async () => {
      const promise = Promise.resolve();
      const setSinkId = jest
        .spyOn<HTMLMediaElement, any>(HTMLAudioElement.prototype, 'setSinkId')
        .mockReturnValue(promise);
      jest.useFakeTimers();
      new Sound({
        ...soundBaseOpts,
        outputDevice: 'device_1',
        isDeviceSound: true,
      });
      jest.runAllTimers();
      await promise;
      expect(setSinkId).toHaveBeenCalledWith('device_1');
    });
    it('should set _hasSinkId to false when setSinkId failed', async () => {
      const promise = Promise.reject();
      const setSinkId = jest
        .spyOn<HTMLMediaElement, any>(HTMLAudioElement.prototype, 'setSinkId')
        .mockReturnValue(promise);
      jest.useFakeTimers();
      new Sound({
        ...soundBaseOpts,
        outputDevice: 'device_1',
        isDeviceSound: true,
      });
      jest.runAllTimers();
      try {
        await promise;
      } catch (e) {
        expect(setSinkId).toHaveBeenCalledWith('device_1');
      }
    });
    it('should create audio element by default setup', () => {
      const sound = new Sound(soundBaseOpts);
      const node = sound.node;
      if (node) {
        expect(node.src.includes(soundBaseOpts.url)).toBeTruthy();
        expect(node.muted).toEqual(soundBaseOpts.muted);
        expect(node.volume).toEqual(soundBaseOpts.volume);
        expect(node.loop).toEqual(soundBaseOpts.loop);
        expect(node.currentTime).toEqual(soundBaseOpts.seek);
        expect(node.pause).toBeTruthy();
        expect(node.ended).toBeFalsy();
      }
      expect(sound.id).toEqual(soundBaseOpts.id);
      expect(sound.muted).toEqual(soundBaseOpts.muted);
      expect(sound.volume).toEqual(soundBaseOpts.volume);
      expect(sound.loop).toEqual(soundBaseOpts.loop);
      expect(sound.seek).toEqual(soundBaseOpts.seek);
      expect(sound.pause).toBeTruthy();
      expect(sound.ended).toBeTruthy();
    });
    it('should set sound duration when sound canplay event called', () => {
      const mockCanplayFn = jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'duration',
          'get',
        )
        .mockReturnValue(100);
      const sound = new Sound(soundBaseOpts);
      if (sound.node) {
        expect(sound.node.duration).toEqual(100);
      }
      expect(mockCanplayFn).toHaveBeenCalled();
    });
    it('should get current seek when sound set seek', () => {
      const seek = 100;
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
    });
    it('should set autoplay when sound set autoplay', () => {
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          autoplay: true,
        }),
      );
      expect(sound.autoplay).toBeTruthy();
      sound.node && expect(sound.autoplay).toBeTruthy();
    });
    it('should set sinkId when sound set output device', () => {
      const deviceId = 'testDeviceId';
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          outputDevice: deviceId,
        }),
      );
      expect(sound.sinkId).toEqual(deviceId);
    });
    it('should have sink id when sound node set sink id', async () => {
      const deviceId = 'testDeviceId';
      jest.useFakeTimers();
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          outputDevice: deviceId,
          isDeviceSound: true,
        }),
      );
      jest.runAllTimers();
      expect(sound.sinkId).toEqual(deviceId);
      if (sound.node) {
        expect(sound.node.sinkId).toEqual(deviceId);
      }
    });
  });

  describe('play()', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
    });

    it('should be playing when sound call play', () => {
      const mockPlayFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      expect(mockPlayFn).toHaveBeenCalled();
      sound.play();
      // try play once
      expect(mockPlayFn).toHaveBeenCalledTimes(2);
    });
    it('should set node current time when sound seek not equal zero', () => {
      const seek = 100;
      const mockPlayFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
      );
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      sound.play();
      expect(mockPlayFn).toHaveBeenCalled();
      if (sound.node) {
        expect(sound.node.currentTime).toEqual(seek);

        sound.node.currentTime = 200;
        sound.play();
        expect(sound.node.currentTime).toEqual(200);
      }
    });
    it('should play in right time when node set current time', () => {
      const seek = 100;
      const mockPlayFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      expect(mockPlayFn).toHaveBeenCalled();
      if (sound.node) {
        sound.node.currentTime = seek;
        sound.play();
        expect(sound.node.currentTime).toEqual(seek);
      }
    });
    it('should stop media when not set sinkId success', async () => {
      const deviceId = 'device1';
      const mockPlayFn = jest
        .spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play')
        .mockResolvedValue(null);
      const mockPauseFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const mockSinkFn = jest
        .spyOn<HTMLMediaElement, any>(HTMLAudioElement.prototype, 'setSinkId')
        .mockRejectedValue(false);
      jest.useFakeTimers();
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          outputDevice: deviceId,
          isDeviceSound: true,
        }),
      );
      jest.runAllTimers();

      expect(sound).toHaveProperty('_isDeviceSound', true);
      expect(mockPauseFn).not.toHaveBeenCalled();
      expect(mockSinkFn).toHaveBeenCalled();

      await sound.play();
      expect(mockPlayFn).toHaveBeenCalled();
      expect(mockPauseFn).toHaveBeenCalled();
    });
    it('should continue play when play no set sinkId success yield', async () => {
      const deviceId = 'device1';
      const mockPlayFn = jest
        .spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play')
        .mockResolvedValue(null);
      const mockPauseFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const mockSinkFn = jest
        .spyOn<HTMLMediaElement, any>(HTMLAudioElement.prototype, 'setSinkId')
        .mockResolvedValue(true);
      jest.useFakeTimers();
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          outputDevice: deviceId,
          isDeviceSound: true,
        }),
      );
      expect(sound._isDeviceSound).toBeTruthy();
      expect(mockPauseFn).not.toHaveBeenCalled();
      await sound.play();
      expect(mockPlayFn).toHaveBeenCalledTimes(2);
      expect(mockPauseFn).toHaveBeenCalled();
      jest.runAllTimers();
      expect(mockSinkFn).toHaveBeenCalled();
    });
  });

  describe('pause()', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    });

    it('should be pause when sound is playing', () => {
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      sound.pause();
      expect(pauseMockFn).toHaveBeenCalled();
      expect(sound.paused).toBeTruthy();
      if (sound.node) {
        expect(sound.node.paused).toBeTruthy();
      }
    });
    it('should get right current time when sound paused', () => {
      const seek = 100;
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
      sound.pause();
      expect(pauseMockFn).not.toHaveBeenCalled();
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
    });
    it('should be play the right time when paused sound be playing', () => {
      const seek = 200;
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      sound.pause();
      expect(pauseMockFn).not.toHaveBeenCalled();
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
      sound.play();
      sound.pause();
      expect(pauseMockFn).toHaveBeenCalled();
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(seek);
    });
  });

  describe('stop()', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    });
    it('should be stop when sound call stop', () => {
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      if (sound.node) {
        sound.node.currentTime = 200;
      }
      sound.stop();
      expect(pauseMockFn).toHaveBeenCalled();
      expect(sound.paused).toBeTruthy();
      expect(sound.ended).toBeTruthy();
      expect(sound.seek).toEqual(0);
      expect(sound.events).toEqual([]);
      expect(sound.currentTime).toEqual(0);
      sound.node && expect(sound.node.currentTime).toEqual(0);
    });
  });

  describe('setMute()', () => {
    it('should mute or unMute when sound call setMute', () => {
      const sound = new Sound(soundBaseOpts);
      expect(sound.muted).toBeFalsy();
      sound.node && expect(sound.node.muted).toBeFalsy();

      sound.setMute(true);
      expect(sound.muted).toBeTruthy();
      sound.node && expect(sound.node.muted).toBeTruthy();

      sound.setMute(false);
      expect(sound.muted).toBeFalsy();
      sound.node && expect(sound.node.muted).toBeFalsy();
    });
  });

  describe('setVolume()', () => {
    it('should set volume when sound call setVolume', () => {
      const sound = new Sound(soundBaseOpts);
      expect(sound.volume).toEqual(1);
      sound.node && expect(sound.node.volume).toEqual(1);

      sound.setVolume(0.5);
      expect(sound.volume).toEqual(0.5);
      sound.node && expect(sound.node.volume).toEqual(0.5);

      sound.setVolume(0);
      expect(sound.volume).toEqual(0);
      sound.node && expect(sound.node.volume).toEqual(0);
    });
    it('should not set volume when volume is inValid', () => {
      const sound = new Sound(soundBaseOpts);
      sound.setVolume(-0.501);
      expect(sound.volume).toEqual(1);
      sound.node && expect(sound.node.volume).toEqual(1);

      sound.setVolume(2.151);
      expect(sound.volume).toEqual(1);
      sound.node && expect(sound.node.volume).toEqual(1);
    });
  });

  describe('setLoop()', () => {
    it('should loop media or not when sound call setLoop', () => {
      const sound = new Sound(soundBaseOpts);
      expect(sound.loop).toBeFalsy();
      sound.node && expect(sound.node.loop).toBeFalsy();

      sound.setLoop(true);
      expect(sound.loop).toBeTruthy();
      sound.node && expect(sound.node.loop).toBeTruthy();

      sound.setLoop(false);
      expect(sound.loop).toBeFalsy();
      sound.node && expect(sound.node.loop).toBeFalsy();
    });
  });

  describe('setSeek()', () => {
    it('should set seek when sound call setSeek', () => {
      const seek = 100;
      const sound = new Sound(soundBaseOpts);
      expect(sound.seek).toEqual(0);

      sound.setSeek(seek);
      expect(sound.seek).toEqual(seek);
    });
    it('should continue play when sound is playing', () => {
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
      const seek = 100;
      const sound = new Sound(soundBaseOpts);
      expect(sound.seek).toEqual(0);

      sound.play();
      expect(sound.paused).toBeFalsy();

      sound.setSeek(seek);
      expect(sound.seek).toEqual(seek);
      expect(sound.paused).toBeFalsy();
    });
    it('should not play when sound set not continue play', () => {
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
      const seek = 100;
      const sound = new Sound(soundBaseOpts);
      expect(sound.seek).toEqual(0);
      expect(sound.paused).toBeTruthy();

      sound.setSeek(seek);
      expect(sound.seek).toEqual(seek);
      expect(sound.paused).toBeTruthy();

      sound.play();
      expect(sound.paused).toBeFalsy();
      sound.setSeek(seek, { continuePlay: false });
      expect(sound.paused).toBeTruthy();
    });
    it('should not set seek when seek is inValid', () => {
      const seek = 100;
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      sound.setSeek(-1);
      expect(sound.seek).toEqual(seek);
    });
    it('should not pause when continue play is true', () => {
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
      );
      const seek = 100;
      const sound = new Sound(soundBaseOpts);
      expect(sound.seek).toEqual(0);

      sound.play();
      expect(sound.paused).toBeFalsy();

      sound.setSeek(seek, {
        continuePlay: true,
      });
      expect(sound.seek).toEqual(seek);
      expect(pauseMockFn).not.toHaveBeenCalled();
      expect(sound.paused).toBeFalsy();
    });
    it('should continue play when sound is not playing and continuePlay is enabled', () => {
      const sound = new Sound(soundBaseOpts);
      jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      sound.setSeek(100, { continuePlay: true });
      expect(sound.paused).toBeFalsy();
    });
  });

  describe('dispose()', () => {
    it('should remove audio node when sound call dispose', async () => {
      const sound = new Sound(soundBaseOpts);
      expect(sound.node).toBeInstanceOf(HTMLMediaElement);

      await sound.dispose();
      expect(sound.node).toEqual(null);
      expect(sound.pause).toBeTruthy();
      expect(sound.ended).toBeTruthy();
      expect(sound.seek).toEqual(0);
      expect(sound.events).toEqual([]);
    });
    it('should unbind all event when media disposed', async () => {
      const loadedEvent = {
        name: 'loadeddata' as MediaEventName,
        type: MediaEventType.ON,
        handler: () => {},
      };
      const sound = new Sound(soundBaseOpts);
      sound.bindEvent(loadedEvent.name, loadedEvent.handler);
      expect(sound.events.length).toEqual(1);

      jest.useFakeTimers();
      await sound.dispose();
      jest.runAllTimers();
      expect(sound.events.length).toEqual(0);
    })
  });

  describe('sound event binding', () => {
    it('should bind on event to node before audio load', () => {
      const listener = jest.spyOn<HTMLMediaElement, any>(
        HTMLAudioElement.prototype,
        'addEventListener',
      );
      const events = [
        {
          name: 'play',
          type: 'on',
          handler: () => {},
        },
      ];
      new Sound(
        Object.assign({}, soundBaseOpts, {
          events,
        }),
      );
      expect(listener).toHaveBeenCalled();
    });
    it('should bind off event to node before audio load', () => {
      const listener = jest.spyOn<HTMLMediaElement, any>(
        HTMLAudioElement.prototype,
        'removeEventListener',
      );
      const events = [
        {
          name: 'play',
          type: 'off',
          handler: () => {},
        },
      ];
      new Sound(
        Object.assign({}, soundBaseOpts, {
          events,
        }),
      );
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('sound dispatch event', () => {
    it('should dispatch event when sound dispatch event', () => {
      const listener = jest.spyOn<HTMLMediaElement, any>(
        HTMLAudioElement.prototype,
        'dispatchEvent',
      );
      const sound = new Sound(soundBaseOpts);
      sound.dispatchEvent(new Event('load'));
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('sound bind event', () => {
    it('should store event when sound bindEvent called', () => {
      const listener = jest.spyOn<HTMLMediaElement, any>(
        HTMLAudioElement.prototype,
        'addEventListener',
      );
      const loadedEvent = {
        name: 'loadeddata' as MediaEventName,
        type: MediaEventType.ON,
        handler: () => {},
      };
      const sound = new Sound(soundBaseOpts);
      expect(sound.events.length).toEqual(0);

      sound.bindEvent(loadedEvent.name, loadedEvent.handler);
      expect(sound.events.length).toEqual(1);
      expect(sound.events[0].name).toEqual(loadedEvent.name);
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('sound unbind event', () => {
    it('should execute unbind event when sound unbindEvent called', () => {
      const listener = jest.spyOn<HTMLMediaElement, any>(
        HTMLAudioElement.prototype,
        'removeEventListener',
      );
      const loadedEvent = {
        name: 'loadeddata' as MediaEventName,
        type: MediaEventType.ON,
        handler: () => {},
      };
      const sound = new Sound(soundBaseOpts);
      sound.bindEvent(loadedEvent.name, loadedEvent.handler);
      expect(sound.events.length).toEqual(1);

      sound.unbindEvent(loadedEvent.name, loadedEvent.handler);
      expect(sound.events.length).toEqual(0);
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('reloadSound()', () => {
    it('should reload audio node when reloadSound called', () => {
      const loadMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLAudioElement.prototype,
        'load',
      );
      const sound = new Sound(soundBaseOpts);
      sound.reloadSound();
      expect(loadMockFn).toBeCalled();
    })
  })
});
