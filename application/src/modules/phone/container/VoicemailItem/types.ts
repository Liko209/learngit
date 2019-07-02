/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:57:42
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { JuiAudioMode, JuiAudioStatus } from 'jui/pattern/AudioPlayer';
import { RCMessage } from 'sdk/module/RCItems';
import { Audio } from '../../types';

type VoicemailViewProps = {
  selected: boolean;
  onChange: (event: React.ChangeEvent, expanded: boolean) => void;
  // id: number;
  caller?: Caller;
  readStatus: Voicemail['readStatus'];
  isUnread: boolean;
  canEditBlockNumbers: boolean;
  audio?: Audio;
  onError: () => void;
  onBeforePlay: () => void;
  onBeforeAction: (status: JuiAudioStatus) => void;
  updateStartTime: (timestamp: number) => void;
  isAudioActive: boolean | Audio | undefined;
  shouldPause: boolean;
  createTime: string;
  direction: RCMessage['direction'];
};

type VoicemailProps = {
  width: number;
  id: number;
};

type ResponsiveObject = {
  JuiAudioMode: JuiAudioMode;
  ButtonToShow: number;
  ShowTranscriptionText: boolean;
  DateFormat: string;
};
enum BREAK_POINT_MAP {
  FULL = 832,
  EXPAND = 640,
  SHORT = 400,
}

export {
  VoicemailViewProps,
  VoicemailProps,
  JuiAudioMode,
  JuiAudioStatus,
  ResponsiveObject,
  BREAK_POINT_MAP,
};
