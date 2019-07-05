/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-28 9:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaTrack } from '../MediaTrack';

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
    window.HTMLMediaElement.prototype.load = jest.fn();

    window.HTMLMediaElement.prototype.play = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create track', () => {
    const mediaTrack = new MediaTrack(trackBaseOpts);
    expect(mediaTrack).toBeInstanceOf(MediaTrack);
  });
  describe('create media track', () => {
    describe('create media track without media', () => {
      it('should create default media track by id', () => {
        const mediaTrack = new MediaTrack(trackBaseOpts);
        expect(mediaTrack.id).toEqual(trackBaseOpts.id);
        expect(mediaTrack.currentMediaId).toEqual(withoutMediaOpts.mediaId);
        expect(mediaTrack.src).toEqual([]);
        expect(mediaTrack.volume).toEqual(1);
        expect(mediaTrack.muted).toBeFalsy();
        expect(mediaTrack.currentTime).toEqual(0);
        expect(mediaTrack.outputDevices).toEqual([]);
        expect(mediaTrack.masterVolume).toEqual(1);
        expect(mediaTrack.currentMediaEvent).toEqual([]);
        expect(mediaTrack.currentMediaUrl).toEqual('');
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
    });
  });

  describe('media track play', () => {
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

  describe('media track pause', () => {
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

  describe('media track stop', () => {
    it('should stop sound when track stop called', () => {
      const mediaTrack = new MediaTrack(
        Object.assign({}, trackBaseOpts, hasMediaOpts),
      );
      mediaTrack.play();
      expect(mediaTrack.playing).toBeTruthy();
      mediaTrack.stop();
      expect(mediaTrack.playing).toBeFalsy();
    });
  });

  describe('media track set mute', () => {
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

  describe('media track set volume', () => {
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

  describe('media track set current time', () => {
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

  describe('media track set master volume', () => {
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

  describe('media track set output devices', () => {
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
      expect(mediaTrack.outputDevices.length).toEqual(0);

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
  });

  describe('media track set options', () => {
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
  });

  describe('media track dispose', () => {
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
});
