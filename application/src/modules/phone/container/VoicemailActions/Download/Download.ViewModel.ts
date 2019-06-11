/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:27:21
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import VoicemailModel from '@/store/models/Voicemail';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store/constants';
import { getEntity } from '@/store/utils';
import { computed, action } from 'mobx';
import { ATTACHMENT_TYPE } from 'sdk/module/RCItems/constants';
import { URI_CONTENT_DISPOSITION_ATTACHMENT } from './constants';
import { DownloadProps } from './types';

class DownloadViewModel extends StoreViewModel<DownloadProps> {
  @computed
  get voicemail() {
    return getEntity<Voicemail, VoicemailModel>(ENTITY_NAME.VOICE_MAIL, this.props.id);
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

  @action
  getUri = async () => {
    if (!this.attachment) {
      return '';
    }
    const voicemailService = ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    );
    const uri = await voicemailService.buildDownloadUrl(this.attachment.uri);
    return `${uri}${URI_CONTENT_DISPOSITION_ATTACHMENT}`;
  }
}

export { DownloadViewModel };
