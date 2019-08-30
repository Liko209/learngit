/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-03 14:02:16
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable, computed } from 'mobx';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { IMediaService } from '@/interface/media';

import { Audio } from '../types';

class PhoneStore {
  @IMediaService private _mediaService: IMediaService;

  @observable audioCache = new Map<number, Audio>();

  // if has voicemailId the voicemail should be expansion
  @observable voicemailId: number | null;

  @observable
  canEditBlockNumbers: boolean = false;

  constructor() {
    this._checkBlockPermission();
  }

  private _checkBlockPermission = async () => {
    const service = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );

    const canEditBlockNumbers = await service.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.EDIT_BLOCKED_PHONE_NUMBER,
    );

    if (canEditBlockNumbers !== this.canEditBlockNumbers) {
      this.setBlockPermission(canEditBlockNumbers);
    }
  };

  @action
  private setBlockPermission = (canEditBlockNumbers: boolean) => {
    this.canEditBlockNumbers = canEditBlockNumbers;
  };

  @action
  addAudio(voicemailId: number, audio: Audio) {
    this.audioCache.set(voicemailId, audio);
  }

  @action
  setVoicemailId(id: number | null) {
    this.voicemailId = id;
  }

  @computed
  get selectedVoicemailId() {
    return this.voicemailId;
  }

  @action
  updateAudio(id: number, props: Partial<Audio>) {
    const audio = this.audioCache.get(id);
    if (audio) {
      this.audioCache.set(id, {
        ...audio,
        ...props,
      });
    }
  }

  @action
  addMediaUpdateListener(id: number) {
    const audio = this.audioCache.get(id);
    if (audio) {
      const media = audio.media;
      const updateFn = () => {
        this.audioCache.set(id, {
          ...audio,
          startTime: 0,
        });
      };
      media.on('ended', () => {
        updateFn();
        media.off('ended', updateFn);
      });
    }
  }

  @computed
  get mediaTrackIds() {
    const voicemailMediaTrackId = this._mediaService.createTrack('voicemail', 200);
    return {
      voicemail: voicemailMediaTrackId,
    }
  }
}

export { PhoneStore };
