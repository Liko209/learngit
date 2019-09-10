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
  describe('setTrackVolume()', () => {
    it('should set track volume and return true when set volume success', () => {
      const trackManager = new TrackManager();
      const track = trackManager.createTrack({
        id: 'track1',
      });
      expect(track.volume).toEqual(1);
      expect(track.id).toEqual('track1');
      trackManager.setTrackVolume(track.id, 0.5);
      expect(track.currentMediaVolume).toEqual(1);
      expect(track.volume).toEqual(0.5);
    });
    it('should not set track volume and return false when set volume to not exist track', () => {
      const trackManager = new TrackManager();
      trackManager.setTrackVolume('noExist', 0.5);
    });
  });
  describe('setAllTrackMasterVolume()', () => {
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
      expect(trackManager.volume).toEqual(1);

      trackManager.setAllTrackMasterVolume(newVolumeValue);
      expect(track1.volume).toEqual(1);
      expect(track1.masterVolume).toEqual(newVolumeValue);
      expect(track2.volume).toEqual(1);
      expect(track2.masterVolume).toEqual(newVolumeValue);
      expect(trackManager.volume).toEqual(newVolumeValue);
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
      expect(track1.outputDevices).toEqual(null);
      expect(track2.outputDevices).toEqual(null);

      trackManager.setAllTrackOutputDevices(newDevices);
      expect(track1.outputDevices).toEqual(newDevices);
      expect(track2.outputDevices).toEqual(newDevices);
    });
  });
  describe('getAllOutputDeviceId()', () => {
    it('should return allOutputDevices ids', () => {
      const newDevices = ['device1', 'device2'];
      const trackManager = new TrackManager();
      trackManager.updateAllOutputDevices(newDevices);
      expect(trackManager.getAllOutputDevicesId()).toEqual(newDevices);
    });
  });
  describe('creatTrack()', () => {
    it('should return exist track when create track', () => {
      const trackManager = new TrackManager();
      trackManager.createTrack({
        id: 'exampleTrack',
      });
      expect(trackManager.tracks.length).toEqual(1);
      trackManager.createTrack({
        id: 'exampleTrack',
      });
      expect(trackManager.tracks.length).toEqual(1);
    });
  });
  describe('updateAllOutputDevices()', () => {
    it('should update all output devices', () => {
      const newDevices = ['device1', 'device2'];
      const trackManager = new TrackManager();

      trackManager.updateAllOutputDevices(newDevices);
      expect(trackManager.outputDevices).toEqual(newDevices);
    });
  });
  describe('setDuckVolume()', () => {
    it('should update duck volume when setDuckVolume called', () => {
      const trackManager = new TrackManager();
      const track = trackManager.createTrack({
        id: 'track1',
      });
      expect(track.volume).toEqual(1);
      expect(trackManager.volume).toEqual(1);
      expect(trackManager.duckVolume).toEqual(1);
      trackManager.setDuckVolume(0.7);
      expect(track.volume).toEqual(1);
      expect(trackManager.volume).toEqual(1);
      expect(trackManager.duckVolume).toEqual(0.7);
      trackManager.setDuckVolume(1);
      expect(track.volume).toEqual(1);
      expect(trackManager.volume).toEqual(1);
      expect(trackManager.duckVolume).toEqual(1);
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
  describe('track priority pool', () => {
    describe('_addPlayingTrackToPool()', () => {
      it('should create new priorityItem to pool when add playing track and not same weight item', () => {
        const trackManager = new TrackManager();
        const playingTrack = trackManager.createTrack({
          id: 'playingTrack',
          weight: 100,
        });

        expect(playingTrack.weight).toEqual(100);
        trackManager._addPlayingTrackToPool(playingTrack.id);
        expect(trackManager._priorityPool).toEqual([
          { ids: ['playingTrack'], weight: 100, position: 0 },
        ]);
      });
      it('should not create new priorityItem to pool but add trackId when add playing track but have same weight item', () => {
        const trackManager = new TrackManager();
        const defaultPriorityItem = { ids: [], weight: 100 };
        trackManager._priorityPool = [defaultPriorityItem];

        const playingTrack = trackManager.createTrack({
          id: 'playingTrack',
          weight: 100,
        });
        expect(trackManager._priorityPool.length).toEqual(1);
        expect(trackManager._getPriorityItemByWeight(100)).toEqual(
          defaultPriorityItem,
        );

        trackManager._addPlayingTrackToPool(playingTrack.id);
        expect(trackManager._priorityPool).toEqual([
          { ids: ['playingTrack'], weight: 100, position: 0 },
        ]);
      });
      it("should not add trackId to priority pool when can't find this track", () => {
        const trackManager = new TrackManager();
        trackManager._addPlayingTrackToPool('noExistTrack');
        expect(trackManager._priorityPool.length).toEqual(0);
      });
    });
    describe('_removePlayingTrackFromPool()', () => {
      it('should remove trackId from pool when remove playing track', () => {
        const trackManager = new TrackManager();
        const defaultPriorityItem = {
          ids: ['playingTrack'],
          weight: 100,
          position: 0,
        };
        trackManager._priorityPool = [defaultPriorityItem];

        const playingTrack = trackManager.createTrack({
          id: 'playingTrack',
          weight: 100,
        });
        expect(trackManager._priorityPool.length).toEqual(1);
        expect(trackManager._getPriorityItemByWeight(100)).toEqual(
          defaultPriorityItem,
        );

        trackManager._removePlayingTrackFromPool(playingTrack.id);
        expect(trackManager._priorityPool).toEqual([]);
      });
      it("should not remove trackId from pool when can't find this trackId", () => {
        const trackManager = new TrackManager();
        trackManager._removePlayingTrackFromPool('noExistTrack');
        expect(trackManager._priorityPool.length).toEqual(0);
      });
    });
    describe('_updatePriorityPoolVolume()', () => {
      it('should set low volume when hight priority item into pool', () => {
        const trackManager = new TrackManager();

        const track1 = trackManager.createTrack({
          id: 'track1',
          weight: 200,
        });

        trackManager._addPlayingTrackToPool(track1.id);

        const track2 = trackManager.createTrack({
          id: 'track2',
          weight: 100,
        });
        trackManager._addPlayingTrackToPool(track2.id);

        expect(trackManager._priorityPool.length).toEqual(2);
        expect(track1.volume).toEqual(0.7);
        expect(track2.volume).toEqual(1);
      });
      it('should set height volume when hight priority item out pool', () => {
        const trackManager = new TrackManager();
        const track1 = trackManager.createTrack({
          id: 'track1',
          weight: 200,
        });

        trackManager._addPlayingTrackToPool(track1.id);
        const track2 = trackManager.createTrack({
          id: 'track2',
          weight: 100,
        });
        trackManager._addPlayingTrackToPool(track2.id);
        expect(trackManager._priorityPool.length).toEqual(2);
        expect(track1.volume).toEqual(0.7);

        trackManager._removePlayingTrackFromPool(track2.id);
        expect(trackManager._priorityPool.length).toEqual(1);
        expect(track1.volume).toEqual(1);
      });
    });
  });
  describe('media track volume priority [JPT-2881]', () => {
    it('should get right priority volume when track playing', () => {
      const trackManager = new TrackManager();

      const track1 = trackManager.createTrack({
        id: 'track1',
        weight: 100,
      });
      const track2 = trackManager.createTrack({
        id: 'track2',
        weight: 200,
      });

      track1._onPlayingEvent(true);
      expect(track1.volume).toEqual(1);
      track2._onPlayingEvent(true);
      expect(track2.volume).toEqual(0.7);

      track1._onPlayingEvent(false);
      expect(track2.volume).toEqual(1);

      track1._onPlayingEvent(true);
      trackManager.setDuckVolume(0.7);

      expect(track1.duckVolume).toEqual(0.7);
      expect(track2.duckVolume).toEqual(0.7);
      expect(track1.currentSoundVolume).toEqual(0.7);
      expect(track2.currentSoundVolume).toEqual(0.7 ** 2);
    });
  });
});
