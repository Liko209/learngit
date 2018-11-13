import moment from 'moment';
import { t } from 'i18next';

function getDateMessage(
  timestamp: any,
  format: string = 'ddd, MMM Do',
): string {
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
    return m.format(format); // Tue, Oct 30th  周二, 10月30日
  }
  return m.format('l'); // 30/10/2018  2018/10/30
}

export { getDateMessage };
