/*
 * @Author: Andy Hu
 * @Date: 2019-01-10 13:44:24
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';
export function getDateTimeStamp(timestamp: number) {
  return moment(timestamp)
    .startOf('day')
    .valueOf();
}
