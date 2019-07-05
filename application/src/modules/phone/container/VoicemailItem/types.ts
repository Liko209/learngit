/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:57:42
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { JuiAudioMode, JuiAudioStatus } from 'jui/pattern/AudioPlayer';
import { RCMessage } from 'sdk/module/RCItems';
import { HoverControllerBaseViewProps } from '../HoverController';
import { Audio, Checker } from '../../types';

type VoicemailViewProps = {
  selected: boolean;
  onChange: (event: React.ChangeEvent, expanded: boolean) => void;
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
  shouldShowCall: () => Promise<boolean>;
};

type VoicemailProps = HoverControllerBaseViewProps & {
  width: number;
  id: number;
};

type CommonResponsiveObject = {
  buttonToShow: number;
  dateFormat: string;
};

type ResponsiveObject = CommonResponsiveObject & {
  audioMode: JuiAudioMode;
  showTranscriptionText: boolean;
};

type Handler = {
  checker: Checker;
  info: ResponsiveObject;
};
enum BREAK_POINT_MAP {
  FULL = 832,
  EXPAND = 640,
  SMALL = 480,
  SHORT = 400,
}

export {
  Handler,
  VoicemailViewProps,
  VoicemailProps,
  JuiAudioMode,
  JuiAudioStatus,
  ResponsiveObject,
  BREAK_POINT_MAP,
  CommonResponsiveObject,
};
