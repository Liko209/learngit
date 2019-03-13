/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-03-13 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import { formatDate } from '../helper';

describe('VersionInfoHelper', () => {
  it('should be format date correct in beijing time', () => {
    const timestamp = 0;
    const ZeroTimeStampInBeijingTime = '1970-01-01 08:00:00';
    expect(formatDate(timestamp)).toEqual(ZeroTimeStampInBeijingTime);
  });
});
