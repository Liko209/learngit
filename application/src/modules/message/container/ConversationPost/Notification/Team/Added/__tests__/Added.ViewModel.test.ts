/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { AddedViewModel } from '../Added.ViewModel';
import { ENTITY_NAME } from '@/store';
import { isPlainObject, isFunction } from 'lodash';

jest.mock('@/store/utils');

const now = Date.now();

const mockPostData = {
  activityData: {
    inviter_id: 1,
    new_user_id: 2,
  },
  createdAt: now,
};

const mockPersonData1 = {
  id: 1,
  userDisplayName: 'Name1',
};

const mockPersonData2 = {
  id: 2,
  userDisplayName: 'Name2',
};

const mapMockPersonData = {
  1: mockPersonData1,
  2: mockPersonData2,
};

const judgePersonData = (personId: number) => {
  return mapMockPersonData[personId];
};

const mockMapData = {
  [ENTITY_NAME.POST]: mockPostData,
  [ENTITY_NAME.PERSON]: judgePersonData,
};

const props = {
  id: 123,
};
const addedViewModel = new AddedViewModel(props);

describe('Team added', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      const data = mockMapData[name];
      if (isPlainObject(data)) {
        return data;
      }
      if (isFunction(data)) {
        return data(id);
      }
      return null;
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed inviterId', () => {
    expect(addedViewModel.inviterId).toBe(mockPostData.activityData.inviter_id);
  });

  it('computed inviterName', () => {
    expect(addedViewModel.inviterName).toBe(mockPersonData1.userDisplayName);
    mockPersonData1.userDisplayName = 'Name3';
    expect(addedViewModel.inviterName).toBe(mockPersonData1.userDisplayName);
  });

  it('computed newUserId', () => {
    expect(addedViewModel.newUserId).toBe(
      mockPostData.activityData.new_user_id,
    );
  });

  it('computed newUserName', () => {
    expect(addedViewModel.newUserName).toBe(mockPersonData2.userDisplayName);
    mockPersonData2.userDisplayName = 'Name4';
    expect(addedViewModel.newUserName).toBe(mockPersonData2.userDisplayName);
  });
});
