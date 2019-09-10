/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-19 08:50:49
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { SanitizedEventItem } from '../entity';

const ONE_HOUR = 60 * 60 * 1000;
const TIME_LENGTHS = {
  ONE_DAY: 24 * ONE_HOUR,
  ONE_WEEKDAY: 24 * ONE_HOUR * 2,
  ONE_WEEK: 7 * 24 * ONE_HOUR,
  ONE_MONTH: 31 * 24 * ONE_HOUR,
  ONE_YEAR: Math.floor(365.26 * 24 * ONE_HOUR),
};

const Event_Constants = {
  NONE: 'none',
  AFTER: 'after',
  REPEAT_ENDING_AFTER: 'repeat_ending_after',
  ON: 'on',
  ALL_DAY: 'all_day',
  END: 'end',
  START: 'start',
};

const Event_Repeat_After = {
  daily: TIME_LENGTHS.ONE_DAY,
  weekdaily: TIME_LENGTHS.ONE_WEEKDAY,
  weekly: TIME_LENGTHS.ONE_WEEK,
  monthly: TIME_LENGTHS.ONE_MONTH,
  yearly: TIME_LENGTHS.ONE_YEAR,
};

const LOG_TAG = 'EventUtils';
class EventUtils {
  static getEffectiveEnd<T extends SanitizedEventItem>(event: T) {
    if (event.created_at === event.modified_at) {
      return event.effective_end;
    }

    let effectiveEnd = event.end;
    const { repeat } = event;
    if (repeat && repeat !== Event_Constants.NONE) {
      if (event.repeat_ending === Event_Constants.ON) {
        effectiveEnd = Number(event.repeat_ending_on);
      } else if (event.repeat_ending === Event_Constants.AFTER) {
        const repeatAfter = Event_Repeat_After[repeat];
        if (repeatAfter) {
          effectiveEnd =
            Number(event.start) +
            Number(event.repeat_ending_after) * Event_Repeat_After[repeat];
        } else {
          mainLogger.error(LOG_TAG, 'unsupported repeat after type');
        }
      } else {
        // forever
        effectiveEnd = Number.MAX_SAFE_INTEGER;
      }
    } else if (event.all_day) {
      effectiveEnd = event.end;
    }

    return effectiveEnd;
  }
}

export { EventUtils };
