/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-17 17:22:19
 * Copyright © RingCentral. All rights reserved.
 */

class TimeUtils {
  static compareDate(lhsTime: number, rhsTime: number) {
    const lhsDate = new Date(lhsTime).toISOString(); // format to: "2019-01-10T08:01:09.471Z"
    const rhsDate = new Date(rhsTime).toISOString();
    if (lhsDate.slice(0, 10) >= rhsDate.slice(0, 10)) {
      return true;
    }
    return false;
  }
}

export { TimeUtils };
