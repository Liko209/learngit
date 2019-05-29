/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-27 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent } from 'react';

enum JuiAudioMode {
  FULL = 'full',
  MINI = 'mini',
}

enum JuiAudioColor {
  PRIMARY = 'primary',
  DEFAULT = 'grey.500',
  ERROR = 'error.main',
}

enum JuiAudioStatus {
  PLAY = 'play',
  PAUSE = 'pause',
  RELOAD = 'reload',
  LOADING = 'loading',
}

interface IJuiAudioAction {
  (status: JuiAudioStatus): void;
}

type JuiAudioActionProps = {
  color?: JuiAudioColor;
  status: JuiAudioStatus;
  tooltip: string;
  onAction: IJuiAudioAction;
};

interface IJuiGetAudioColor {
  (status: JuiAudioStatus, isHighlight: boolean): JuiAudioColor;
}

interface IJuiAudioProgressChange {
  (event: ChangeEvent, value: number): void;
}

type JuiAudioProgressProps = {
  mode: JuiAudioMode;
  value: number;
  duration: number;
  onChange: IJuiAudioProgressChange;
  onDragStart(): void;
  onDragEnd(): void;
};

type JuiAudioActionTips = {
  play: string;
  pause: string;
  reload: string;
};

type JuiAudioPlayerProps = {
  src: string;
  duration: number;
  actionTips: JuiAudioActionTips;
  mode?: JuiAudioMode;
  startTime?: number;
  isHighlight?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (timestamp: number) => void;
};

export {
  ChangeEvent,
  JuiAudioMode,
  JuiAudioColor,
  JuiAudioStatus,
  IJuiAudioAction,
  IJuiGetAudioColor,
  JuiAudioActionTips,
  JuiAudioActionProps,
  JuiAudioPlayerProps,
  JuiAudioProgressProps,
  IJuiAudioProgressChange,
};
