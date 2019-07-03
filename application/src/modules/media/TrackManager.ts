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

class TrackManager {
  private _tracks: MediaTrack[] = [];
  private _volume: number = 1;
  private _outputDevices: MediaDeviceType[] = [];

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

  setAllTrackVolume(vol: number) {
    this._tracks.forEach(track => {
      track.setMasterVolume(vol);
    });
  }

  setAllTrackOutputDevices(devices: MediaDeviceType[]) {
    this._outputDevices = devices;
    this._tracks.forEach(track => {
      track.setOutputDevices(devices);
    });
  }

  getTrack(id: string) {
    return this._getTrackById(id);
  }

  getAllOutputDevicesId() {
    return this._outputDevices;
  }

  createTrack(options: MediaTrackOptions) {
    return this._createTrack(options);
  }

  dispose() {
    this._tracks.forEach(track => {
      track.dispose();
    });

    this._tracks = [];
    this._volume = 1;
    this._outputDevices = [];
  }

  private _getTrackById(id: string) {
    const track = this._tracks.filter(track => {
      return track.id === id;
    });
    return track.length !== 0 ? track[0] : null;
  }

  private _getAllTrackIds() {
    return this._tracks.map(track => {
      return track.id;
    });
  }

  private _createTrack(options: MediaTrackOptions) {
    const newTrack = new MediaTrack(
      Object.assign(options, {
        masterVolume: this._volume,
      }),
    );
    this._tracks.push(newTrack);
    return newTrack;
  }

  get tracks() {
    return this._tracks;
  }

  get volume() {
    return this._volume;
  }

  get outputDevices() {
    return this._outputDevices;
  }
}

const trackManager = new TrackManager();

export { trackManager, TrackManager };
