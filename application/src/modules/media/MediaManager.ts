/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MediaOptions, MediaDeviceType } from '@/interface/media';
import { trackManager } from './TrackManager';
import { Media } from './Media';
import { Utils } from './Utils';

class MediaManager {
  private _canPlayTypes: string[] = [];

  private _muted: boolean = false;
  private _globalVolume: number = 1;
  private _outputDevices: MediaDeviceType[] = [];

  private _medias: Media[] = [];
  private _mediaCounters: number = 1000;

  createMedia(opts: MediaOptions) {
    const mediaTrack = trackManager.useMediaTrack(opts.trackId);
    const mediaId = Utils.formatMediaId({
      trackId: mediaTrack.id,
      mediaId: opts.id || `${this._mediaCounters++}`
    });
    const newMedia = new Media(
      Object.assign({}, opts, {
        trackId: mediaTrack.id,
        id: mediaId
      })
    );
    this._medias.push(newMedia);
    return newMedia;
  }

  getMedia(mediaId: string | number) {
    let media: Media;
    const checkMediaId = mediaId.toString();
    const medias = this._medias.filter(media => media.id === checkMediaId);
    if (!medias || (medias && medias.length === 0)) {
      media = this._medias.filter(media => {
        const oriMediaId = Utils.dismantleMediaId(media.id);
        return oriMediaId.mediaId === checkMediaId;
      })[0];
    } else {
      media = medias[0];
    }

    return media || null;
  }

  setGlobalVolume(vol: number) {
    if (!Utils.isValidVolume(vol)) {
      return;
    }
    this._globalVolume = vol;
    trackManager.setAllTrackVolume(vol);
  }

  setOutputDevices(devices: MediaDeviceType[]) {
    if (Array.isArray(devices) && devices.length === 0) {
      return;
    }
    this._outputDevices = devices;
    trackManager.setAllTrackOutputDevices(devices);
  }

  canPlayType(mimeType: string) {
    if (this._canPlayTypes.includes(mimeType)) {
      return true;
    }
    try {
      const test = new Audio();
      const canPlay = test.canPlayType(mimeType) !== '';
      canPlay && this._canPlayTypes.push(mimeType);
      return canPlay;
    } catch (e) {
      return false;
    }
  }

  dispose() {
    trackManager.dispose();
    this._muted = false;
    this._globalVolume = 1;
    this._outputDevices = [];
  }

  get muted() {
    return this._muted;
  }

  get globalVolume() {
    return this._globalVolume;
  }

  get outputDevices() {
    return this._outputDevices;
  }

  get canPlayTypes() {
    return this._canPlayTypes;
  }
}

const mediaManager = new MediaManager();

export { mediaManager, MediaManager };
