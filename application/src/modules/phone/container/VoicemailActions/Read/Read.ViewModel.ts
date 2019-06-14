/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import VoicemailModel from '@/store/models/Voicemail';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store/constants';
import { getEntity } from '@/store/utils';
import { computed, action } from 'mobx';
import { ReadProps } from './types';

class ReadViewModel extends StoreViewModel<ReadProps> {
  @computed
  get voicemail() {
    return getEntity<Voicemail, VoicemailModel>(ENTITY_NAME.VOICE_MAIL, this.props.id);
  }

  @computed
  get isRead() {
    const { readStatus } = this.voicemail;
    return readStatus === READ_STATUS.READ;
  }

  @action
  read = async () => {
    const toStatus = this.isRead ? READ_STATUS.UNREAD : READ_STATUS.READ;
    const voicemailService = ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    );
    await voicemailService.updateReadStatus(this.props.id, toStatus);
  }
}

export { ReadViewModel };
