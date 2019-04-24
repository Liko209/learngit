/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-14 13:23:22
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../../store/utils';
import { MenuViewModel } from '../Menu.ViewModel';
import { CONVERSATION_TYPES } from '@/constants';

jest.mock('../../../../../store/utils');

const mockEntityGroup = {
  displayName: 'Group name',
  type: CONVERSATION_TYPES.NORMAL_GROUP,
};

const props = {
  id: 1,
};

let vm: MenuViewModel;

describe('MenuViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vm = new MenuViewModel(props);
    vm.getDerivedProps(props);
  });

  describe('isGroup', () => {
    it('should be true when group entity type is group [JPT-1389]', () => {
      mockEntityGroup.type = CONVERSATION_TYPES.NORMAL_GROUP;
      (getEntity as jest.Mock).mockReturnValue(mockEntityGroup);
      expect(vm.isGroup).toEqual(true);
    });

    it('should be false when group entity type is team [JPT-1389]', () => {
      mockEntityGroup.type = CONVERSATION_TYPES.TEAM;
      (getEntity as jest.Mock).mockReturnValue(mockEntityGroup);
      expect(vm.isGroup).toEqual(false);
    });

    it('should be false when group entity type is one to one talk [JPT-1389]', () => {
      mockEntityGroup.type = CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
      (getEntity as jest.Mock).mockReturnValue(mockEntityGroup);
      expect(vm.isGroup).toEqual(false);
    });
  });
});
