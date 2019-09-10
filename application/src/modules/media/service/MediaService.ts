/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IMediaService,
  MediaOptions,
  MediaDeviceType,
} from '@/interface/media';
import { mediaManager } from '../MediaManager';
import { computed, autorun } from 'mobx';
import { UserSettingEntity } from 'sdk/module/setting';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';
import { trackManager } from '../TrackManager';

const SETTING_ITEM__VOLUME = SettingEntityIds.Phone_Volume;
const SETTING_ITEM__SPEAKER_SOURCE = SettingEntityIds.Phone_SpeakerSource;

class MediaService implements IMediaService {
  private _globalVolume: number = 1;
  private _allOutputDevices: MediaDeviceType[] = [];

  constructor() {
    autorun(() => {
      if (this.globalVolume !== this._globalVolume) {
        mediaManager.setGlobalVolume(this.globalVolume);
        this._globalVolume = this.globalVolume;
      }
      if (this.allOutputDevices !== this._allOutputDevices) {
        mediaManager.updateAllOutputDevices(this.allOutputDevices);
        this._allOutputDevices = this.allOutputDevices;
      }
    });
  }

  createMedia(mediaOptions: MediaOptions) {
    mediaManager.setGlobalVolume(this.globalVolume);
    return mediaManager.createMedia(mediaOptions);
  }

  getMedia(mediaId: string) {
    return mediaManager.getMedia(mediaId);
  }

  canPlayType(mimeType: string) {
    mediaManager.canPlayType(mimeType);
    return true;
  }

  createTrack(trackId: string, weight?: number) {
    const newTrack = trackManager.createTrack({
      id: trackId,
      weight,
    });
    return newTrack.id;
  }

  setDuckVolume(volume: number) {
    trackManager.setDuckVolume(volume);
  }

  @computed
  get volumeEntity() {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      SETTING_ITEM__VOLUME,
    );
  }

  @computed
  get globalVolume() {
    return this.volumeEntity.value;
  }

  @computed
  get outputDeviceEntity() {
    return getEntity<UserSettingEntity, SettingModel>(
      ENTITY_NAME.USER_SETTING,
      SETTING_ITEM__SPEAKER_SOURCE,
    );
  }

  @computed
  get allOutputDevices() {
    const devices = this.outputDeviceEntity.source;
    let deviceIds = [];
    if (Array.isArray(devices) && devices.length !== 0) {
      deviceIds = devices
        .filter(
          device =>
            !MediaService.isDefaultDevice(device) &&
            !MediaService.isVirtualDevice(device),
        )
        .map(device => device.deviceId);
    }
    return deviceIds;
  }

  static isDefaultDevice(device: MediaDeviceInfo) {
    return device.deviceId === 'default' || /default/gi.test(device.label);
  }

  static isVirtualDevice(device: MediaDeviceInfo) {
    return /Virtual/gi.test(device.label);
  }
}

export { MediaService };
