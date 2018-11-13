/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../store/utils';
import { AddedViewModel } from '../Added.ViewModel';
import { ENTITY_NAME } from '@/store';
import moment from 'moment';

jest.mock('../../../../../../store/utils');

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
  displayName: 'Name1',
};

const mockPersonData2 = {
  id: 2,
  displayName: 'Name2',
};

const props = {
  id: 123,
};
const addedViewModel = new AddedViewModel(props);

describe('Team added', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      if (name === ENTITY_NAME.POST) {
        return mockPostData;
      }
      if (name === ENTITY_NAME.PERSON) {
        if (id === 1) {
          return mockPersonData1;
        }
        if (id === 2) {
          return mockPersonData2;
        }
        return null;
      }
      return null;
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed createdAt', () => {
    expect(addedViewModel.createdAt).toEqual(moment(now).format('lll'));
  });

  it('computed inviterId', () => {
    expect(addedViewModel.inviterId).toBe(mockPostData.activityData.inviter_id);
  });

  it('computed inviterName', () => {
    expect(addedViewModel.inviterName).toBe(mockPersonData1.displayName);
    mockPersonData1.displayName = 'Name3';
    expect(addedViewModel.inviterName).toBe(mockPersonData1.displayName);
  });

  it('computed newUserId', () => {
    expect(addedViewModel.newUserId).toBe(
      mockPostData.activityData.new_user_id,
    );
  });

  it('computed newUserName', () => {
    expect(addedViewModel.newUserName).toBe(mockPersonData2.displayName);
    mockPersonData2.displayName = 'Name4';
    expect(addedViewModel.newUserName).toBe(mockPersonData2.displayName);
  });
});
