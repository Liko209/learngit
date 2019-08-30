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
  muted: false,
};

const mediaBaseOpts = {
  src: ['example1.mp3'],
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
    it('should media disposed', () => {
      const mediaManager = new MediaManager();
      const media = mediaManager.createMedia(mediaBaseOpts);

      media.dispose();
      expect(mediaManager._medias).toEqual([]);
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
          id: mediaId,
        }),
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
      const setAllTrackMasterVolume = jest.spyOn(
        trackManager,
        'setAllTrackMasterVolume',
      );
      const mediaManager = new MediaManager();
      mediaManager.setGlobalVolume(0.5);
      expect(mediaManager.globalVolume).toEqual(0.5);
      expect(setAllTrackMasterVolume).toHaveBeenCalled();
    });
    it('should not set all track volume when volume value is inValid', () => {
      const setAllTrackMasterVolume = jest.spyOn(
        trackManager,
        'setAllTrackMasterVolume',
      );
      const mediaManager = new MediaManager();
      mediaManager.setGlobalVolume(1.5);
      expect(mediaManager.globalVolume).toEqual(1);
      expect(setAllTrackMasterVolume).not.toHaveBeenCalled();
    });
  });
  describe('setOutputDevices()', () => {
    it('should set all media volume when media manager set volume', () => {
      const devices = ['device1', 'device2'];
      const setAllTrackOutputDevices = jest.spyOn(
        trackManager,
        'setAllTrackOutputDevices',
      );
      const mediaManager = new MediaManager();
      mediaManager.setOutputDevices(devices);
      expect(mediaManager.outputDevices).toEqual(devices);
      expect(setAllTrackOutputDevices).toHaveBeenCalled();
    });
  });
  describe('updateAllOutputDevices()', () => {
    it('should update all device media when media manager update all output devices', () => {
      const oldAllDevice = ['oldDevice'];
      const newAllDevices = ['device1', 'device2'];
      const updateAllOutputDevices = jest.spyOn(
        trackManager,
        'updateAllOutputDevices',
      );

      const mediaSetOutputDevices = jest.fn();
      const media = ({
        outputDevices: oldAllDevice,
        setOutputDevices: mediaSetOutputDevices,
      } as any) as Media;

      const mediaManager = new MediaManager();
      mediaManager._medias = [media];
      mediaManager._allOutputDevices = oldAllDevice;

      mediaManager.updateAllOutputDevices(newAllDevices);
      expect(updateAllOutputDevices).toHaveBeenCalled();
      expect(mediaSetOutputDevices).toHaveBeenCalled();
    });
  });
  describe('getAllDevicesMedia()', () => {
    it('should not return media when media not have any output devices', () => {
      const media = ({
        outputDevices: [],
      } as any) as Media;

      const mediaManager = new MediaManager();
      mediaManager._medias = [media];
      mediaManager._allOutputDevices = [];

      const allMedias = mediaManager.getAllDevicesMedia();
      expect(allMedias).toEqual([]);
    });
    it('should return media when media have one or more output devices', () => {
      const media = ({
        outputDevices: ['device1'],
      } as any) as Media;

      const mediaManager = new MediaManager();
      mediaManager._medias = [media];
      mediaManager._allOutputDevices = ['device1'];

      const allMedias = mediaManager.getAllDevicesMedia();
      expect(allMedias).toEqual([media]);
    });
    it('should not return media when media output device not same as all output device', () => {
      const media = ({
        outputDevices: ['device1'],
      } as any) as Media;

      const mediaManager = new MediaManager();
      mediaManager._medias = [media];
      mediaManager._allOutputDevices = ['device1', 'device2'];

      const allMedias = mediaManager.getAllDevicesMedia();
      expect(allMedias).toEqual([]);
    });
    it('should not return media when media output device is null', () => {
      const media = ({
        outputDevices: null,
      } as any) as Media;

      const mediaManager = new MediaManager();
      mediaManager._medias = [media];
      mediaManager._allOutputDevices = [];

      const allMedias = mediaManager.getAllDevicesMedia();
      expect(allMedias).toEqual([]);
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
      expect(mediaManager.canPlayTypes.length).toEqual(1);

      expect(mediaManager.canPlayTypes).toEqual(['audio/mp3']);
      mediaManager.canPlayType('audio/mp3');
      expect(mockFun).toHaveBeenCalledTimes(1);
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
