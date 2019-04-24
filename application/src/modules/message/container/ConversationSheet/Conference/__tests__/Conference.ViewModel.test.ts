/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-19 23:36:19
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity, getGlobalValue } from '../../../../../../store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ConferenceViewModel } from '../Conference.ViewModel';
jest.mock('../../../../store/utils');

const mockData = {
  creatorId: 101,
  rcData: {
    phoneNumber: '+1650618xxxx',
    hostCode: '123123',
    participantCode: '456456',
  },
};
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 101,
};

const viewModel = new ConferenceViewModel({ ids: [1] });

describe('Conference View Model', () => {
  beforeEach(() => {
    (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
      return mockGlobalValue[key];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('globalNumber', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(viewModel.globalNumber).toEqual('https://ringcentr.al/2L14jqL');
  });

  it('isHostByMe should be true when item creator is myself [JPT-963]', () => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    expect(viewModel.isHostByMe).toBeTruthy();
  });

  it('isHostByMe should be false when item creator is not myself [JPT-963]', () => {
    (getEntity as jest.Mock).mockReturnValue({ ...mockData, creatorId: 102 });
    expect(viewModel.isHostByMe).toBeFalsy();
  });
});
