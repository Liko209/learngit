/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../store/utils';
import { ProfileMiniCardGroupViewModel } from '../MiniCardGroup.ViewModel';

jest.mock('../../../../../store/utils');

const mockData = {
  displayName: 'Group name',
  isTeam: true,
};

const props = {
  id: 1,
};
let vm: ProfileMiniCardGroupViewModel;

describe('Note item', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileMiniCardGroupViewModel(props);
  });

  it('computed id', () => {
    expect(vm.id).toEqual(props.id);
  });

  it('computed group', () => {
    expect(vm.group).toEqual(mockData);
    mockData.displayName = 'Group name 2';
    mockData.isTeam = false;
    expect(vm.group).toEqual(mockData);
  });
});
