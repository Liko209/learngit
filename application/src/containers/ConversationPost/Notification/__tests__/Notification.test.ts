/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { NotificationViewModel } from '../Notification.ViewModel';
import { ENTITY_NAME } from '@/store';

jest.mock('../../../../store/utils');

const mockPostData = {
  id: 123,
  activityData: { key: 'members' },
};

const mockMap = {
  [ENTITY_NAME.POST]: mockPostData,
};

const props = {
  id: 123,
};
const notificationViewModel = new NotificationViewModel(props);

describe('Conversation post notification', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed id', () => {
    expect(notificationViewModel.id).toEqual(props.id);
  });

  it('computed activityData', () => {
    expect(notificationViewModel.activityData).toBe(mockPostData.activityData);
  });
});
