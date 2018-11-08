/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 09:48:58
 * Copyright © RingCentral. All rights reserved.
 */

import moment from 'moment';
import i18next, { t } from 'i18next';

function getDateMessage(timestamp: any): string {
  moment.locale(i18next.language);
  const m = moment(timestamp)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  const now = moment()
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  const diff = now.diff(m, 'days', true);
  if (diff === 0) {
    return t('today');
  }
  if (diff === 1) {
    return t('yesterday');
  }
  if (diff === -1) {
    return t('tomorrow');
  }
  if (diff <= 7) {
    return m.format('ddd, MMM Do'); // Tue, Oct 30th  周二, 10月30日
  }
  return m.format('l'); // 30/10/2018  2018/10/30
}

export default getDateMessage;
