/*
 * @Author: ken.li
 * @Date: 2019-07-04 10:23:22
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiAudioMode } from 'jui/components/AudioPlayer';
import { BREAK_POINT_MAP } from './types';
import { DATE_FORMAT } from '@/utils/date';
import { MAX_BUTTON_COUNT } from '../constants';

const voiceMailDefaultResponsiveInfo = {
  audioMode: JuiAudioMode.FULL,
  buttonToShow: MAX_BUTTON_COUNT,
  showTranscriptionText: true,
  dateFormat: DATE_FORMAT.full,
};

const responsiveByBreakPoint = [
  {
    checker: (width: number) => width >= BREAK_POINT_MAP.FULL,
    info: voiceMailDefaultResponsiveInfo,
  },
  {
    checker: (width: number) =>
      width >= BREAK_POINT_MAP.EXPAND && width < BREAK_POINT_MAP.FULL,
    info: {
      audioMode: JuiAudioMode.FULL,
      buttonToShow: 2,
      showTranscriptionText: false,
      dateFormat: DATE_FORMAT.full,
    },
  },
  {
    checker: (width: number) =>
      width > BREAK_POINT_MAP.SHORT && width < BREAK_POINT_MAP.EXPAND,
    info: {
      audioMode: JuiAudioMode.MINI,
      buttonToShow: 2,
      showTranscriptionText: false,
      dateFormat: DATE_FORMAT.full,
    },
  },
  {
    checker: (width: number) => width <= BREAK_POINT_MAP.SHORT,
    info: {
      audioMode: JuiAudioMode.TINY,
      buttonToShow: 1,
      showTranscriptionText: false,
      dateFormat: DATE_FORMAT.short,
    },
  },
];

export { responsiveByBreakPoint, voiceMailDefaultResponsiveInfo };
