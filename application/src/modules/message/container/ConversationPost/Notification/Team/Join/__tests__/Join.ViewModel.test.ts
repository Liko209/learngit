/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../../../store/utils';
import { JoinViewModel } from '../Join.ViewModel';
import { ENTITY_NAME } from '@/store';

jest.mock('../../../../../../store/utils');

const now = Date.now();

const mockPostData = {
  activityData: {
    new_user_id: 1,
  },
  createdAt: now,
};

const mockPersonData = {
  id: 1,
  userDisplayName: 'Name1',
};

const mockMap = {
  [ENTITY_NAME.POST]: mockPostData,
  [ENTITY_NAME.PERSON]: mockPersonData,
};

const props = {
  id: 123,
};
const joinViewModel = new JoinViewModel(props);

describe('Team join', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed newUserId', () => {
    expect(joinViewModel.newUserId).toBe(mockPostData.activityData.new_user_id);
  });

  it('computed newUserName', () => {
    expect(joinViewModel.newUserName).toBe(mockPersonData.userDisplayName);
    mockPersonData.userDisplayName = 'Name2';
    expect(joinViewModel.newUserName).toBe(mockPersonData.userDisplayName);
  });
});
