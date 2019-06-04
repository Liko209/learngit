/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 13:37:46
 * Copyright © RingCentral. All rights reserved.
 */

import { RCMessage, Caller } from '../../types';
import { VM_TRANSCRIPTION_STATUS } from '../../constants';
import { IdModel } from 'sdk/framework/model';

type Voicemail = RCMessage & {
  vmTranscriptionStatus: VM_TRANSCRIPTION_STATUS;
};

type VoicemailView = IdModel & {
  creationTime: string;
  lastModifiedTime: string;
  from: Caller;
  to: Caller;
};

export { Voicemail, VoicemailView };
