/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { StoreViewModel } from '@/store/ViewModel';
import { catchError } from '@/common/catchError';
import { action } from 'mobx';
import { DeleteProps } from './types';

class DeleteViewModel extends StoreViewModel<DeleteProps> {
  @catchError.flash({
    network: 'voicemail.prompt.notAbleToDeleteVoicemailForNetworkIssue',
    server: 'voicemail.prompt.notAbleToDeleteVoicemailForServerIssue',
  })
  @action
  delete = async () => {
    const voicemailService = ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    );
    return voicemailService.deleteVoicemails([this.props.id]);
  }
}

export { DeleteViewModel };
