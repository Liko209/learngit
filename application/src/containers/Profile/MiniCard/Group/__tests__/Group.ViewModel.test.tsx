/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../store/utils';
import { ProfileMiniCardGroupViewModel } from '../Group.ViewModel';

jest.mock('../../../../../store/utils');

const mockData = {
  displayName: 'Group name',
  isTeam: true,
};

const props = {
  id: 1,
};
let vm: ProfileMiniCardGroupViewModel;

describe('ProfileMiniCardGroupViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileMiniCardGroupViewModel(props);
  });

  describe('id', () => {
    it('should be get group id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('group', () => {
    it('should be get group entity when invoke class instance property group [JPT-405]', () => {
      expect(vm.group).toEqual(mockData);
    });

    it('should be get changed group entity when change group entity data [JPT-405]', () => {
      mockData.displayName = 'Group name 2';
      mockData.isTeam = false;
      expect(vm.group).toEqual(mockData);
    });
  });
});
