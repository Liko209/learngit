/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { CallLogService } from 'sdk/module/RCItems/callLog';
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
  deleteVoicemail = async () => {
    const voicemailService = ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    );
    return voicemailService.deleteVoicemails([this.props.id as number]);
  }

  @catchError.flash({
    network: 'calllog.prompt.notAbleToDeleteCallLogForNetworkIssue',
    server: 'calllog.prompt.notAbleToDeleteCallLogForServerIssue',
  })
  @action
  deleteCallLog = async () => {
    const callLogService = ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    );
    return callLogService.deleteCallLogs([this.props.id as string]);
  }
}

export { DeleteViewModel };
