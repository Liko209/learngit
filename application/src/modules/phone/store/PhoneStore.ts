/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-03 14:02:16
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable, computed } from 'mobx';

import { Audio } from '../types';

class PhoneStore {
  @observable audioCache = new Map<number, Audio>();
  // if has voicemailId the voicemail should be expansion
  @observable voicemailId: number | null;

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
}

export { PhoneStore };
