/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:07:06
 * Copyright © RingCentral. All rights reserved.
 */

import ConferenceItemModel from '../ConferenceItem';

describe('ConferenceItemModel', () => {
  it('new ConferenceItemModel', () => {
    const itemModel = ConferenceItemModel.fromJS({
      rc_data: {
        phoneNumber: 'phone number',
        hostCode: '123456',
        participantCode: '233233233',
      },
    } as any);
    expect(itemModel.phoneNumber).toBe('phone number');
    expect(itemModel.hostCode).toBe('123456');
    expect(itemModel.participantCode).toBe('233233233');
  });
});
