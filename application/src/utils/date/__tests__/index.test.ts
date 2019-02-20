/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:26:01
 * Copyright © RingCentral. All rights reserved.
 */
import { dateFormatter } from '../';
import { handerTimeZoneOffset } from '../../../utils/date';

const CHINATIMEZONE = -480;
describe('dateFormatter', () => {
  it('format date', () => {
    expect(
      dateFormatter.date(handerTimeZoneOffset(1547086968632, CHINATIMEZONE)),
    ).toBe('1/10/2019');
  });
});
