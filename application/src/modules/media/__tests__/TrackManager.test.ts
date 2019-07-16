/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 13:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { TrackManager } from '../TrackManager';
import { MediaTrack } from '../MediaTrack';
import { DEFAULT_TRACK_ID } from '@/interface/media';

describe('TrackManager', () => {
  beforeEach(() => {
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'load');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'play');
    jest.spyOn<HTMLMediaElement, any>(HTMLMediaElement.prototype, 'pause');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  describe('useMediaTrack()', () => {
    it('should create track when use track without trackId', () => {
      const trackManager = new TrackManager();
      const useMediaTrack = trackManager.useMediaTrack();
      expect(useMediaTrack.id).toEqual(DEFAULT_TRACK_ID);
    });
    it('should use default track when default track is exist', () => {
      const trackManager = new TrackManager();
      const useMediaTrack = trackManager.useMediaTrack();
      expect(useMediaTrack.id).toEqual(DEFAULT_TRACK_ID);

      const newMediaTrack = trackManager.useMediaTrack();
      expect(newMediaTrack.id).toEqual(DEFAULT_TRACK_ID);
      expect(newMediaTrack).toEqual(useMediaTrack);
    });
    it('should create track when track not have this id track', () => {
      const trackManager = new TrackManager();
      const trackId = 'testTrackId';
      const track = trackManager.useMediaTrack(trackId);
      expect(track).toBeInstanceOf(MediaTrack);
      expect(trackManager.tracks.length).toEqual(1);
      expect(trackManager.tracks[0].id).toEqual(trackId);
      expect(trackManager.getTrack(trackId)).toEqual(track);
    });
    it('should get track when track have this id track', () => {
      const oldTrackId = 'oldTrackId';
      const trackManager = new TrackManager();
      const oldTrack = trackManager.createTrack(
        Object.assign({}, oldTrackId, {
          id: oldTrackId,
        }),
      );
      expect(trackManager.tracks.length).toEqual(1);
      expect(trackManager.tracks[0].id).toEqual(oldTrackId);
      expect(trackManager.getTrack(oldTrackId)).toEqual(oldTrack);
      const useMediaTrack = trackManager.useMediaTrack(oldTrackId);
      expect(useMediaTrack).toEqual(oldTrack);
    });
  });
  describe('setAllTrackVolume', () => {
    it('should set all track master volume when track manager set volume', () => {
      const newVolumeValue = 0.5;
      const trackManager = new TrackManager();
      const track1 = trackManager.createTrack({
        id: 'track1',
      });
      const track2 = trackManager.createTrack({
        id: 'track2',
      });
      expect(track1.volume).toEqual(1);
      expect(track2.volume).toEqual(1);

      trackManager.setAllTrackVolume(newVolumeValue);
      expect(track1.masterVolume).toEqual(newVolumeValue);
      expect(track2.masterVolume).toEqual(newVolumeValue);
    });
  });
  describe('setAllTrackOutputDevice()', () => {
    it('should set all track output devices when track manager set output device', () => {
      const newDevices = ['device1', 'device2'];
      const trackManager = new TrackManager();
      const track1 = trackManager.createTrack({
        id: 'track1',
      });
      const track2 = trackManager.createTrack({
        id: 'track2',
      });
      expect(track1.outputDevices).toEqual([]);
      expect(track2.outputDevices).toEqual([]);

      trackManager.setAllTrackOutputDevices(newDevices);
      expect(track1.outputDevices).toEqual(newDevices);
      expect(track2.outputDevices).toEqual(newDevices);
    });
  });
  describe('dispose()', () => {
    it('should dispose all track and reset trackManager', () => {
      const trackManager = new TrackManager();
      const track1 = trackManager.createTrack({
        id: 'track1',
      });
      const track2 = trackManager.createTrack({
        id: 'track2',
      });
      expect(trackManager.getTrack('track1')).toEqual(track1);
      expect(trackManager.getTrack('track2')).toEqual(track2);

      trackManager.dispose();
      expect(trackManager.tracks).toEqual([]);
      expect(trackManager.volume).toEqual(1);
      expect(trackManager.outputDevices).toEqual([]);
    });
  });
});
