/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-06-11 13:48:34
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';

export default {
  prettyTime: function(time, options) {
    return moment(time)
      .format('h:mm A')
      .replace(/^0:/, '12:');
  },

  prettyDate: function(time) {
    if (!time) {
      return '';
    }
    const now = new Date().getTime();
    const today = new Date(now);
    const timeDay = new Date(time);
    if (moment(today).isSame(timeDay, 'day')) {
      return 'today';
    }
    const nextDay = moment(timeDay).add(1, 'day');
    if (moment(today).isSame(nextDay, 'day')) {
      return 'yesterday';
    }
    const prevDay = moment(timeDay).subtract(1, 'day');
    if (moment(today).isSame(prevDay, 'day')) {
      return 'tomorrow';
    }
    if (timeDay.getFullYear() === today.getFullYear()) {
      return moment(time).format('ddd, MMM D');
    }
    return moment(time).format('ddd, MMM D, YYYY');
  }
};
