/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:39:02
 * Copyright © RingCentral. All rights reserved.
 */

import { container, jupiter } from 'framework';
import { computed, action, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import VoicemailModel from '@/store/models/Voicemail';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity';
import { ATTACHMENT_TYPE, READ_STATUS } from 'sdk/module/RCItems/constants';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Notification } from '@/containers/Notification';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { analyticsCollector } from '@/AnalyticsCollector';
import { VoicemailViewProps, VoicemailProps, Handler } from './types';
import {
  voiceMailDefaultResponsiveInfo,
  responsiveByBreakPoint,
} from './config';
import { PhoneStore } from '../../store';
import { Audio } from '../../types';
import { ANALYTICS_KEY } from '../constants';
import { IMediaService } from '@/interface/media';

const FLASH_TOAST_DURATION = 3000;

class VoicemailItemViewModel extends StoreViewModel<VoicemailProps>
  implements VoicemailViewProps {
  private _phoneStore: PhoneStore = container.get(PhoneStore);
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

  @observable
  private _mediaPlaying: boolean = false;

  @observable canEditBlockNumbers: boolean = false;

  constructor(props: VoicemailProps) {
    super(props);

    this._fetchBlockPermission();

    this.reaction(
      () => this.attachment,
      async (audio?: Audio) => {
        const { id, onVoicemailPlay } = this.props;
        const phoneStore = this._phoneStore;
        const audioCache = phoneStore.audioCache.get(id);
        if (audio && !audioCache) {
          phoneStore.addAudio(id, {
            ...audio,
            downloadUrl: '',
            startTime: 0,
          });
        } else if (audioCache && audioCache.media) {
          audioCache.media.playing &&
            !this.selected &&
            onVoicemailPlay &&
            onVoicemailPlay(id);

          audioCache.media.playing && (this._mediaPlaying = true);
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  private get _mediaService() {
    return jupiter.get<IMediaService>(IMediaService);
  }

  private _getResponsiveMap(handler: Handler[]) {
    const windowWidth = this.props.width;
    for (let i = 0; i < handler.length; i++) {
      const { checker, info } = handler[i];
      if (checker(windowWidth)) {
        return info;
      }
    }
    return voiceMailDefaultResponsiveInfo;
  }

  @computed
  get voiceMailResponsiveMap() {
    return this._getResponsiveMap(responsiveByBreakPoint);
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
      this.props.id,
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
    return this.props.activeVoicemailId === this.props.id;
  }

  @computed
  get showFullAudioPlayer() {
    return this.selected && this._mediaPlaying;
  }

  @action
  onChange = (event: React.ChangeEvent, newExpanded: boolean) => {
    this._phoneStore.setVoicemailId(newExpanded ? this.props.id : null);
  };

  @action
  onBeforePlay = async () => {
    const { id } = this.props;
    if (!this.selected) {
      this.props.onVoicemailPlay(id);
    }
    await this.voicemailService.updateReadStatus(id, READ_STATUS.READ);

    if (this.audio) {
      const ret = await this.voicemailService.buildDownloadUrl(this.audio.uri);
      if (!ret) return false;

      const oldCache = this._phoneStore.audioCache.get(id);

      if (oldCache && oldCache.downloadUrl === ret) {
        return true;
      }
      const media = this._mediaService.createMedia({
        id: id.toString(),
        trackId: 'voicemail-track',
        src: ret,
      });
      this._phoneStore.updateAudio(id, {
        media,
        downloadUrl: ret,
      });
    }

    return true;
  };

  @action
  onPaused = () => {
    analyticsCollector.playPauseVoicemail(ANALYTICS_KEY.VOICEMAIL_ACTION_PAUSE);
    this._mediaPlaying = false;
  };

  @action
  onPlay = () => {
    analyticsCollector.playPauseVoicemail(ANALYTICS_KEY.VOICEMAIL_ACTION_PLAY);
    this._mediaPlaying = true;
  };

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
  };

  @action
  onEnded = () => {
    this._phoneStore.updateAudio(this.props.id, {
      startTime: 0,
    });
  };

  @action
  updateStartTime = (timestamp: number) => {
    if (this.selected || (this.props.isHover && !this._mediaPlaying)) {
      this._phoneStore.updateAudio(this.props.id, {
        startTime: timestamp,
      });
    }
  };

  @computed
  get createTime() {
    return this.voicemail.creationTime;
  }

  private async _fetchBlockPermission() {
    this.canEditBlockNumbers = await this._rcInfoService.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.EDIT_BLOCKED_PHONE_NUMBER,
    );
  }

  shouldShowCall = async () => {
    return this._rcInfoService.isVoipCallingAvailable();
  };

  dispose() {
    super.dispose();
    if (this._mediaPlaying) {
      this._phoneStore.addMediaUpdateListener(this.props.id);
    }
  }
}

export { VoicemailItemViewModel };
