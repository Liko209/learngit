/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:39:02
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { computed, action, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity, getGlobalValue } from '@/store/utils';
import VoicemailModel from '@/store/models/Voicemail';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity';
import { postTimestamp } from '@/utils/date';
import { ATTACHMENT_TYPE, READ_STATUS } from 'sdk/module/RCItems/constants';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { GLOBAL_KEYS } from '@/store/constants';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { analyticsCollector } from '@/AnalyticsCollector';
import {
  VoicemailViewProps,
  VoicemailProps,
  JuiAudioMode,
  JuiAudioStatus,
} from './types';
import { PhoneStore } from '../../store';
import { Audio } from '../../types';
import { ANALYTICS_KEY } from '../constants';

const FLASH_TOAST_DURATION = 3000;

class VoicemailItemViewModel extends StoreViewModel<VoicemailProps>
  implements VoicemailViewProps {
  private _phoneStore: PhoneStore = container.get(PhoneStore);
  // in order to handle incoming call
  @observable shouldPause: boolean = false;

  constructor(props: VoicemailProps) {
    super(props);

    this.reaction(
      () => getGlobalValue(GLOBAL_KEYS.INCOMING_CALL),
      () => {
        this.shouldPause = true;
      },
    );

    this.reaction(
      () => this.attachment,
      async (audio?: Audio) => {
        const phoneStore = this._phoneStore;
        if (audio && !phoneStore.audioCache.get(this._id)) {
          phoneStore.addAudio(this._id, {
            ...audio,
            downloadUrl: '',
            startTime: 0,
          });
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  get _id() {
    return this.props.id;
  }

  get voicemailService() {
    return ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    );
  }

  @computed
  get voicemail() {
    return getEntity<Voicemail, VoicemailModel>(
      ENTITY_NAME.VOICE_MAIL,
      this._id,
    );
  }

  @computed
  get direction() {
    return this.voicemail.direction;
  }

  @computed
  get isUnread() {
    return this.readStatus === READ_STATUS.UNREAD;
  }

  @computed
  get readStatus() {
    return this.voicemail.readStatus;
  }

  @computed
  get caller() {
    return this.voicemail.from;
  }

  @computed
  get attachment() {
    const attachments = this.voicemail.attachments;
    if (!attachments) {
      return;
    }
    return attachments.filter(
      attachments => attachments.type === ATTACHMENT_TYPE.AUDIO_RECORDING,
    )[0];
  }

  @computed
  get audio() {
    const attachment = this.attachment;
    if (!attachment) {
      return;
    }
    return this._phoneStore.audioCache.get(attachment.id);
  }

  @computed
  get selected() {
    return this._phoneStore.selectedVoicemailId === this._id;
  }

  @computed
  get mode() {
    if (!this.audio) {
      return;
    }
    return this.selected ? JuiAudioMode.FULL : JuiAudioMode.MINI;
  }

  @action
  onChange = (event: React.ChangeEvent, newExpanded: boolean) => {
    this._phoneStore.setVoicemailId(newExpanded ? this._id : null);
  }

  @action
  onBeforePlay = async () => {
    this.shouldPause = false;

    if (!this.selected) {
      this._phoneStore.setVoicemailId(this._id);
    }
    this.voicemailService.updateReadStatus(this._id, READ_STATUS.READ);
  }

  @action
  onBeforeAction = async (status: JuiAudioStatus) => {
    if (status === JuiAudioStatus.PAUSE) {
      analyticsCollector.playPauseVoicemail(
        ANALYTICS_KEY.VOICEMAIL_ACTION_PAUSE,
      );
      return;
    }
    if (status === JuiAudioStatus.PLAY) {
      analyticsCollector.playPauseVoicemail(
        ANALYTICS_KEY.VOICEMAIL_ACTION_PLAY,
      );
      if (this.audio) {
        const ret = await this.voicemailService.buildDownloadUrl(
          this.audio.uri,
        );
        this._phoneStore.updateAudio(this._id, {
          downloadUrl: ret,
        });
      }
      return;
    }
  }

  @action
  onError = () => {
    Notification.flashToast({
      message: 'phone.prompt.playVoicemailLoadError',
      autoHideDuration: FLASH_TOAST_DURATION,
      type: ToastType.ERROR,
      fullWidth: false,
      dismissible: false,
      messageAlign: ToastMessageAlign.LEFT,
    });
  }

  @action
  updateStartTime = (timestamp: number) => {
    this._phoneStore.updateAudio(this._id, {
      startTime: timestamp,
    });
  }

  @computed
  get createTime() {
    const { creationTime } = this.voicemail;
    return postTimestamp(creationTime);
  }
}

export { VoicemailItemViewModel };
