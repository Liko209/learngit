/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-27 12:40:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  MediaDeviceType,
  MediaTrackOptions,
  DEFAULT_TRACK_ID,
} from '@/interface/media';
import { MediaTrack } from './MediaTrack';

type PriorityItemType = {
  position: number;
  weight: number;
  ids: string[];
};

class TrackManager {
  private _tracks: MediaTrack[] = [];
  private _allOutputDevices: MediaDeviceType[] = [];
  private _globalVolume: number = 1;
  private _duckVolume: number = 1;
  private _priorityPool: PriorityItemType[] = [];

  useMediaTrack(trackId?: string) {
    let mediaTrack: MediaTrack;

    if (trackId) {
      const trackIds = this._getAllTrackIds();
      mediaTrack = trackIds.includes(trackId)
        ? (this._getTrackById(trackId) as MediaTrack)
        : this._createTrack({
            id: trackId,
          });
    } else {
      mediaTrack =
        this._getTrackById(DEFAULT_TRACK_ID) ||
        this._createTrack({
          id: DEFAULT_TRACK_ID,
        });
    }

    return mediaTrack;
  }

  setAllTrackMasterVolume(vol: number) {
    this._globalVolume = vol;
    this._tracks.forEach(track => {
      track.setMasterVolume(vol);
    });
  }

  setAllTrackOutputDevices(devices: MediaDeviceType[]) {
    this._allOutputDevices = devices;
    this._tracks.forEach(track => {
      track.setOutputDevices(devices);
    });
  }

  setTrackVolume(trackId: string, vol: number) {
    const track = this._getTrackById(trackId);
    track && track.setVolume(vol);
  }

  getTrack(id: string) {
    return this._getTrackById(id);
  }

  getAllOutputDevicesId() {
    return this._allOutputDevices;
  }

  createTrack(options: MediaTrackOptions) {
    return this._getTrackById(options.id) || this._createTrack(options);
  }

  updateAllOutputDevices(devices: MediaDeviceType[]) {
    this._allOutputDevices = devices;
  }

  setDuckVolume(volume: number) {
    this._duckVolume = volume;
    this._tracks.forEach(track => {
      track.setDuckVolume(volume);
    });
  }

  dispose() {
    this._tracks.forEach(track => {
      track.dispose();
    });

    this._tracks = [];
    this._allOutputDevices = [];
    this._globalVolume = 1;
    this._duckVolume = 1;
  }

  private _getTrackById(id: string) {
    const track = this._tracks.filter(track => track.id === id);
    return track.length !== 0 ? track[0] : null;
  }

  private _getAllTrackIds() {
    return this._tracks.map(track => track.id);
  }

  private _createTrack(options: MediaTrackOptions) {
    const newTrack = new MediaTrack({
      masterVolume: this._globalVolume,
      duckVolume: this._duckVolume,
      ...options,
    });
    this._tracks.push(newTrack);

    // listen track playing
    newTrack.onPlaying((isPlaying: boolean) => {
      if (isPlaying) {
        this._addPlayingTrackToPool(newTrack.id);
      } else {
        this._removePlayingTrackFromPool(newTrack.id);
      }
    });
    return newTrack;
  }

  private _addPlayingTrackToPool(trackId: string) {
    const mediaTrack = this._getTrackById(trackId);
    if (!mediaTrack) {
      return;
    }

    const priorityItem = this._getPriorityItemByWeight(mediaTrack.weight);

    if (priorityItem && !priorityItem.ids.includes(trackId)) {
      priorityItem.ids.push(trackId);
    } else if (!priorityItem) {
      const newPriorityItem: PriorityItemType = {
        position: 0,
        weight: mediaTrack.weight,
        ids: [trackId],
      };
      this._priorityPool.push(newPriorityItem);
    } else {
      return;
    }

    this._updatePriorityPoolVolume();
  }

  private _removePlayingTrackFromPool(trackId: string) {
    const mediaTrack = this._getTrackById(trackId);
    if (!mediaTrack) {
      return;
    }

    const priorityItem = this._getPriorityItemByWeight(mediaTrack.weight);
    const oldPosition = (priorityItem && priorityItem.position) || 0;

    if (priorityItem && priorityItem.ids.includes(trackId)) {
      priorityItem.ids = priorityItem.ids.filter(id => trackId !== id);
    } else {
      return;
    }

    this._updatePriorityPoolVolume();
    mediaTrack.setVolume(mediaTrack.volume / 0.7 ** oldPosition);
  }

  private _getPriorityItemByWeight(
    weight: number,
    pool?: PriorityItemType[],
  ): PriorityItemType | null {
    const _pool = pool || this._priorityPool;
    const priorityItem = _pool.filter(item => {
      return item.weight === weight;
    });
    return priorityItem.length === 0 ? null : priorityItem[0];
  }

  private _updatePriorityPoolVolume() {
    const oldPriorityPool = JSON.parse(JSON.stringify(this._priorityPool));

    this._priorityPool = this._priorityPool
      .sort((a, b) => a.weight - b.weight)
      .filter(item => item.ids.length !== 0);

    this._priorityPool.forEach((item, idx) => {
      item.position = idx;
      const currentPosition = idx;
      const oldPriorityItem = this._getPriorityItemByWeight(
        item.weight,
        oldPriorityPool,
      );
      const oldPosition = oldPriorityItem
        ? oldPriorityItem.position
        : currentPosition;

      if (currentPosition !== oldPosition) {
        item.ids.forEach(id => {
          const track = this._getTrackById(id);
          if (track) {
            const volume =
              currentPosition - oldPosition > 0
                ? track.volume * 0.7 ** currentPosition
                : track.volume / 0.7 ** oldPosition;

            this.setTrackVolume(id, volume);
          }
        });
      }
    });
  }

  get tracks() {
    return this._tracks;
  }

  get volume() {
    return this._globalVolume;
  }

  get duckVolume() {
    return this._duckVolume;
  }

  get outputDevices() {
    return this._allOutputDevices;
  }
}

const trackManager = new TrackManager();

export { trackManager, TrackManager };
