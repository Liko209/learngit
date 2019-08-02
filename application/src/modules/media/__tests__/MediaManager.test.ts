/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaManager } from '../MediaManager';
import { trackManager } from '../TrackManager';
import { MediaTrack } from '../MediaTrack';
import { Media } from '../Media';

const trackBaseOpts = {
  id: 'testTrackId',
  volume: 1,
  muted: false
};

const mediaBaseOpts = {
  src: ['example1.mp3']
};

describe('MediaManager', () => {
  beforeEach(() => {
    jest
      .spyOn(trackManager, 'useMediaTrack')
      .mockReturnValue(new MediaTrack(trackBaseOpts));
    jest
      .spyOn(trackManager, 'getTrack')
      .mockReturnValue(new MediaTrack(trackBaseOpts));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('createMedia()', () => {
    it('should create new media', () => {
      const mediaManager = new MediaManager();
      const media = mediaManager.createMedia(mediaBaseOpts);
      expect(media).toBeInstanceOf(Media);
      expect(media.trackId).toEqual(trackBaseOpts.id);
      expect(media.id).toEqual(`[${trackBaseOpts.id}]-[1000]`);
      const media2 = mediaManager.createMedia(mediaBaseOpts);
      expect(media2.id).toEqual(`[${trackBaseOpts.id}]-[1001]`);
    });
  });
  describe('getMedia()', () => {
    it('should get media if media is exist and create media without id', () => {
      const mediaManager = new MediaManager();
      const media = mediaManager.createMedia(mediaBaseOpts);
      expect(media.trackId).toEqual(trackBaseOpts.id);
      expect(media.id).toEqual(`[${trackBaseOpts.id}]-[1000]`);

      const mediaId = `[${trackBaseOpts.id}]-[1000]`;
      const checkMedia = mediaManager.getMedia(mediaId);
      expect(checkMedia).toEqual(media);
    });
    it('should get media if media is exist and create media with id', () => {
      const mediaManager = new MediaManager();
      const mediaId = 1234124123;
      const media = mediaManager.createMedia(
        Object.assign({}, mediaBaseOpts, {
          id: mediaId
        })
      );
      expect(media.trackId).toEqual(trackBaseOpts.id);
      expect(media.id).toEqual(`[${trackBaseOpts.id}]-[${mediaId}]`);

      const checkMedia = mediaManager.getMedia(mediaId);
      expect(checkMedia).toEqual(media);
    });
    it('should not get media if media is not exist', () => {
      const mediaManager = new MediaManager();
      expect(mediaManager.getMedia('')).toEqual(null);
    });
  });

  describe('setVolume()', () => {
    it('should set all track volume when media manager set volume', () => {
      const setAllTrackVolume = jest.spyOn(trackManager, 'setAllTrackVolume');
      const mediaManager = new MediaManager();
      mediaManager.setGlobalVolume(0.5);
      expect(mediaManager.globalVolume).toEqual(0.5);
      expect(setAllTrackVolume).toHaveBeenCalled();
    });
    it('should not set all track volume when volume value is inValid', () => {
      const setAllTrackVolume = jest.spyOn(trackManager, 'setAllTrackVolume');
      const mediaManager = new MediaManager();
      mediaManager.setGlobalVolume(1.5);
      expect(mediaManager.globalVolume).toEqual(1);
      expect(setAllTrackVolume).not.toHaveBeenCalled();
    });
  });
  describe('setOutputDevices()', () => {
    it('should set all media volume when media manager set volume', () => {
      const devices = ['device1', 'device2'];
      const setAllTrackOutputDevices = jest.spyOn(
        trackManager,
        'setAllTrackOutputDevices'
      );
      const mediaManager = new MediaManager();
      mediaManager.setOutputDevices(devices);
      expect(mediaManager.outputDevices).toEqual(devices);
      expect(setAllTrackOutputDevices).toHaveBeenCalled();
    });
  });
  describe('canPlayType()', () => {
    it('should return media mime type can be play', () => {
      const mockFun = jest
        .spyOn(HTMLAudioElement.prototype, 'canPlayType')
        .mockImplementation(() => 'maybe');
      const mediaManager = new MediaManager();
      const canPlayType = mediaManager.canPlayType('audio/mp3');
      expect(mockFun).toHaveBeenCalled();
      expect(canPlayType).toEqual(true);
    });
  });
  describe('reset()', () => {
    it('should reset media manager and dispose trackManager', () => {
      const mediaManager = new MediaManager();
      mediaManager.dispose();
      expect(mediaManager.muted).toBeFalsy();
      expect(mediaManager.globalVolume).toEqual(1);
      expect(mediaManager.outputDevices).toEqual([]);
    });
  });
});
