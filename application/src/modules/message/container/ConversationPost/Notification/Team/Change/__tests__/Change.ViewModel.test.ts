/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../../../store/utils';
import { ChangeViewModel } from '../Change.ViewModel';
import { ENTITY_NAME } from '@/store';

jest.mock('../../../../../../store/utils');

const now = Date.now();

const mockPostData = {
  activityData: {
    value: 'New team name',
    old_value: 'Old team name',
    changer_id: 1,
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
const changeViewModel = new ChangeViewModel(props);

describe('Team change', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed changerId', () => {
    expect(changeViewModel.changerId).toBe(
      mockPostData.activityData.changer_id,
    );
  });

  it('computed changerName', () => {
    expect(changeViewModel.changerName).toBe(mockPersonData.userDisplayName);
    mockPersonData.userDisplayName = 'Name2';
    expect(changeViewModel.changerName).toBe(mockPersonData.userDisplayName);
  });

  it('computed value', () => {
    expect(changeViewModel.value).toBe(mockPostData.activityData.value);
  });

  it('computed oldValue', () => {
    expect(changeViewModel.oldValue).toBe(mockPostData.activityData.old_value);
  });
});
