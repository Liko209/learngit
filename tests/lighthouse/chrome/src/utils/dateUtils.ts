/*
 * @Author: doyle.wu
 * @Date: 2019-05-17 14:23:54
 */
import * as dateFormat from 'dateformat';

class DateUtils {

  static getTimeRange(min: number, max: number): string {

    const str1 = dateFormat(new Date(min), "yyyy-mm-dd");
    const str2 = dateFormat(new Date(max), "yyyy-mm-dd");

    const result = [str1];
    if (str1 !== str2) {
      result.push(str2);
    }

    return result.join(' ~ ');
  }
}

export {
  DateUtils
}
