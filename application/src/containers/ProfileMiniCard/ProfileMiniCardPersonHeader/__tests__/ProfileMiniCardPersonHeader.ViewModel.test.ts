/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { ProfileMiniCardPersonHeaderViewModel } from '../ProfileMiniCardPersonHeader.ViewModel';

jest.mock('../../../../store/utils');

const mockData = {
  userDisplayName: 'Person Name',
  awayStatus: 'online',
  title: 'Developer',
};

const props = {
  id: 1,
};
const vm = new ProfileMiniCardPersonHeaderViewModel(props);

describe('Note item', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed id', () => {
    expect(vm.id).toEqual(props.id);
  });

  it('computed person', () => {
    expect(vm.person).toEqual(mockData);
    mockData.userDisplayName = 'Person Name 2';
    mockData.awayStatus = 'offline';
    mockData.title = 'PM';
    expect(vm.person).toEqual(mockData);
  });
});
