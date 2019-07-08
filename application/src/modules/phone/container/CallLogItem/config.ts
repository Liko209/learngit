/*
 * @Author: ken.li
 * @Date: 2019-07-04 10:30:23
 * Copyright © RingCentral. All rights reserved.
 */
import { BREAK_POINT_MAP } from '../VoicemailItem/types';
import { DATE_FORMAT } from '@/utils/date';

const callLogDefaultResponsiveInfo = {
  buttonToShow: 3,
  showCallInfo: true,
  dateFormat: DATE_FORMAT.full,
};
const kHandlers = [
  {
    checker: (width: number) => width >= BREAK_POINT_MAP.FULL,
    info: callLogDefaultResponsiveInfo,
  },
  {
    checker: (width: number) =>
      width < BREAK_POINT_MAP.FULL && width >= BREAK_POINT_MAP.SMALL,
    info: {
      buttonToShow: 2,
      showCallInfo: true,
      dateFormat: DATE_FORMAT.full,
    },
  },
  {
    checker: (width: number) =>
      width > BREAK_POINT_MAP.SHORT && width < BREAK_POINT_MAP.SMALL,
    info: {
      buttonToShow: 1,
      showCallInfo: true,
      dateFormat: DATE_FORMAT.short,
    },
  },
  {
    checker: (width: number) => width <= BREAK_POINT_MAP.SHORT,
    info: {
      buttonToShow: 1,
      showCallInfo: false,
      dateFormat: DATE_FORMAT.short,
    },
  },
];

export { callLogDefaultResponsiveInfo, kHandlers };
