/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity, getGlobalValue } from '@/store/utils';
import { ProfileMiniCardGroupFooterViewModel } from '../Footer.ViewModel';

jest.mock('@/store/utils');
jest.mock('sdk/api');
jest.mock('sdk/dao');

const mockData = {
  members: [1, 2, 3],
};

const props = {
  id: 123,
  dismiss: jest.fn(),
};
let vm: ProfileMiniCardGroupFooterViewModel;

describe('ProfileDialogGroupViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileMiniCardGroupFooterViewModel(props);
  });

  describe('showMessage', () => {
    it('should be get true when invoke class instance property showMessage [JPT-405]', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(1);
      expect(vm.showMessage).toEqual(true);
    });

    it('should be get false when invoke class instance property showMessage [JPT-405]', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(4);
      expect(vm.showMessage).toEqual(false);
    });
  });

  describe('analysis', () => {
    it('should return analysis type when pass value', () => {
      const analysisType = '1';
      (getEntity as jest.Mock).mockReturnValueOnce({
        analysisType,
      });
      expect(vm.analysisType).toEqual(analysisType);
    });
  });
});
