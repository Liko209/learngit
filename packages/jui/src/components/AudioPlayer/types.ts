/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-07-22 16:30:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ChangeEvent } from 'react';

enum JuiAudioMode {
  FULL = 'full',
  MINI = 'mini',
  TINY = 'tiny',
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
  label: string;
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
  status: JuiAudioStatus;
  duration: number;
  onChange: IJuiAudioProgressChange;
  onDragStart(): void;
  onDragEnd(): void;
};

type JuiAudioActionMap = {
  [JuiAudioStatus.PLAY]: JuiAudioActionType;
  [JuiAudioStatus.PAUSE]: JuiAudioActionType;
  [JuiAudioStatus.RELOAD]: JuiAudioActionType;
};

type JuiAudioActionType = {
  label?: string;
  tooltip?: string;
  handler: () => void;
};

type JuiAudioPlayerProps = {
  duration: number;
  status: JuiAudioStatus;
  timestamp?: number;
  mode?: JuiAudioMode;
  isHighlight?: boolean;
  actions: JuiAudioActionMap;

  onPlay?: () => void;
  onPause?: () => void;
  onReload?: () => void;
  onProcessDragged?: () => void;
  onTimeStampChanged?: (timestamp: number) => void;
};

export {
  ChangeEvent,
  JuiAudioMode,
  JuiAudioColor,
  JuiAudioStatus,
  IJuiAudioAction,
  IJuiGetAudioColor,
  JuiAudioActionMap,
  JuiAudioActionProps,
  JuiAudioPlayerProps,
  JuiAudioProgressProps,
  IJuiAudioProgressChange,
};
