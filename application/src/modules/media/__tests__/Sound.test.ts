/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 13:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Sound } from '../Sound';

const soundBaseOpts = {
  id: 'testId',
  url: 'testUrl',
  muted: false,
  volume: 1,
  seek: 0,
};

describe('Sound', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'load', {
      configurable: true,
      get() {
        return () => {};
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      get() {
        return () => {};
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      get() {
        return () => {};
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
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
    it('should create audio element by default setup', () => {
      const sound = new Sound(soundBaseOpts);
      const node = sound.node;
      if (node) {
        expect(node.src.includes(soundBaseOpts.url)).toBeTruthy();
        expect(node.muted).toEqual(soundBaseOpts.muted);
        expect(node.volume).toEqual(soundBaseOpts.volume);
        expect(node.currentTime).toEqual(soundBaseOpts.seek);
        expect(node.pause).toBeTruthy();
        expect(node.ended).toBeFalsy();
      }
      expect(sound.id).toEqual(soundBaseOpts.id);
      expect(sound.muted).toEqual(soundBaseOpts.muted);
      expect(sound.volume).toEqual(soundBaseOpts.volume);
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
      expect(mockCanplayFn).toBeCalled();
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
    it('should set sinkId when sound set output device', () => {
      const deviceId = 'testDeviceId';
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          outputDevice: deviceId,
        }),
      );
      expect(sound.sinkId).toEqual(deviceId);
    });
    it.skip('should have sink id when sound node set sink id', () => {
      // jsdom HTMLMediaElement.prototype not have sinkId
      const deviceId = 'testDeviceId';
      const mockSinkFn = jest
        .spyOn<HTMLMediaElement, any>(
          HTMLMediaElement.prototype,
          'sinkId',
          'get',
        )
        .mockReturnValue('deviceId');
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          outputDevice: deviceId,
        }),
      );
      expect(mockSinkFn).toBeCalled();
      expect(sound.sinkId).toEqual(deviceId);
      if (sound.node) {
        expect(sound.node.sinkId).toEqual(deviceId);
      }
    });
  });

  describe('sound play', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
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
        'get',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      expect(mockPlayFn).toBeCalled();
      sound.play();
      // try play once
      expect(mockPlayFn).toBeCalledTimes(2);
    });
    it('should set node current time when sound seek not equal zero', () => {
      const seek = 100;
      const mockPlayFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
        'get',
      );
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      sound.play();
      expect(mockPlayFn).toBeCalled();
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
        'get',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      expect(mockPlayFn).toBeCalled();
      if (sound.node) {
        sound.node.currentTime = seek;
        sound.play();
        expect(sound.node.currentTime).toEqual(seek);
      }
    });
  });

  describe('sound pause', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
        'get',
      );
    });

    it('should be pause when sound is playing', () => {
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
        'get',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      sound.pause();
      expect(pauseMockFn).toBeCalled();
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
        'get',
      );
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
      sound.pause();
      expect(pauseMockFn).not.toBeCalled();
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
    });
    it('should be play the right time when paused sound be playing', () => {
      const seek = 200;
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
        'get',
      );
      const sound = new Sound(
        Object.assign({}, soundBaseOpts, {
          seek,
        }),
      );
      sound.pause();
      expect(pauseMockFn).not.toBeCalled();
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(0);
      sound.play();
      sound.pause();
      expect(pauseMockFn).toBeCalled();
      expect(sound.seek).toEqual(seek);
      expect(sound.currentTime).toEqual(seek);
    });
  });

  describe('sound stop', () => {
    beforeEach(() => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
        'get',
      );
    });
    it('should be stop when sound call stop', () => {
      const pauseMockFn = jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'pause',
        'get',
      );
      const sound = new Sound(soundBaseOpts);
      sound.play();
      if (sound.node) {
        sound.node.currentTime = 200;
      }
      sound.stop();
      expect(pauseMockFn).toBeCalled();
      expect(sound.paused).toBeTruthy();
      expect(sound.ended).toBeTruthy();
      expect(sound.seek).toEqual(0);
    });
  });

  describe('sound set mute', () => {
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

  describe('sound set volume', () => {
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

  describe('sound set seek', () => {
    it('should set seek when sound call setSeek', () => {
      const seek = 100;
      const sound = new Sound(soundBaseOpts);
      expect(sound.seek).toEqual(0);

      sound.setSeek(seek);
      expect(sound.seek).toEqual(seek);
    });
    it('should continue play when sound is playing', () => {
      jest
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
        'get',
      );
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
        .spyOn<HTMLAudioElement, any>(
          HTMLMediaElement.prototype,
          'readyState',
          'get',
        )
        .mockReturnValue('5');
      jest.spyOn<HTMLMediaElement, any>(
        HTMLMediaElement.prototype,
        'play',
        'get',
      );
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
          seek: seek,
        }),
      );
      sound.setSeek(-1);
      expect(sound.seek).toEqual(seek);
    });
  });

  describe('sound dispose', () => {
    it('should remove audio node when sound call dispose', () => {
      const sound = new Sound(soundBaseOpts);
      expect(sound.node).toBeInstanceOf(HTMLMediaElement);

      sound.dispose();
      expect(sound.node).toEqual(null);
    });
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
          events: events,
        }),
      );
      expect(listener).toBeCalled();
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
          events: events,
        }),
      );
      expect(listener).toBeCalled();
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
      expect(listener).toBeCalled();
    });
  });
});
