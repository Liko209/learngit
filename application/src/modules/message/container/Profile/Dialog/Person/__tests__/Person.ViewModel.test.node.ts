/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { ProfileDialogPersonViewModel } from '../Person.ViewModel';

jest.mock('@/store/utils');
jest.mock('sdk/dao');
jest.mock('sdk/module/person');
const mockData = {
  userDisplayName: 'Name 1',
  awayStatus: 'Status 1',
  jobTitle: 'Title 1',
};

const props = {
  id: 1,
};
let vm: ProfileDialogPersonViewModel;

describe('ProfileDialogPersonViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileDialogPersonViewModel(props);
  });

  describe('id', () => {
    it('should be get person id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('person', () => {
    it('should be get person entity when invoke class instance property person [JPT-441]', () => {
      expect(vm.person).toEqual(mockData);
    });

    it('should be get changed person entity when change person entity data [JPT-441]', () => {
      mockData.userDisplayName = 'Name 2';
      mockData.awayStatus = 'Status 2';
      mockData.jobTitle = 'Title 2';
      expect(vm.person).toEqual(mockData);
    });
  });
});
