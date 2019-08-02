/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 14:57:42
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { JuiAudioMode, JuiAudioStatus } from 'jui/components/AudioPlayer';
import { RCMessage } from 'sdk/module/RCItems';
import { HoverControllerBaseViewProps } from '../HoverController';
import { Audio, Checker } from '../../types';
import { ActiveVoicemailId } from '../Voicemail/types';

type VoicemailViewProps = {
  selected: boolean;
  onChange: (event: React.ChangeEvent, expanded: boolean) => void;
  caller?: Caller;
  readStatus: Voicemail['readStatus'];
  isUnread: boolean;
  canEditBlockNumbers: boolean;
  audio?: Audio;
  onPlay: () => void;
  onPaused: () => void;
  onError: () => void;
  onEnded: () => void;
  onBeforePlay: () => Promise<boolean> | boolean;
  updateStartTime: (timestamp: number) => void;
  showFullAudioPlayer: boolean;
  createTime: string;
  direction: RCMessage['direction'];
  shouldShowCall: () => Promise<boolean>;
};

type VoicemailProps = HoverControllerBaseViewProps & {
  width: number;
  id: number;
  activeVoicemailId: ActiveVoicemailId;
  onVoicemailPlay(id: ActiveVoicemailId): void;
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
  SMALL = 520,
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
