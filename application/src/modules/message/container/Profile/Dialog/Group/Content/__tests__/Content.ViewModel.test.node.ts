/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity, getGlobalValue } from '@/store/utils';
import { ProfileDialogGroupContentViewModel } from '../Content.ViewModel';
import { i18nP } from '@/utils/i18nT';
import { Notification } from '@/containers/Notification';

jest.mock('@/store/utils');
jest.mock('@/utils/i18nT');

const mockData = {
  members: [1, 2, 3],
};

const props = {
  id: 123,
  dismiss: jest.fn(),
};
let vm: ProfileDialogGroupContentViewModel;

describe('ProfileDialogGroupViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    (i18nP as jest.Mock).mockReturnValue('');
    Notification.flashToast = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileDialogGroupContentViewModel(props);
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
  describe('destinationId [FIJI-4359]', () => {
    it('should use original id if there is not converted to team', () => {
      expect(vm.destinationId).toEqual(123);
    });
    it('should use new team id if group has been converted to team', () => {
      const data = {
        id: 123,
        dismiss: jest.fn(),
        convertedToTeam: { team_id: 10 },
      };
      (getEntity as jest.Mock).mockReturnValue(data);
      vm = new ProfileDialogGroupContentViewModel(props);
      expect(vm.destinationId).toEqual(10);
    });
    it('should use original id if group only has empty convertedToTeam', () => {
      const analysisType = '1';
      const data = {
        id: 123,
        dismiss: jest.fn(),
        convertedToTeam: {},
        analysisType,
      };
      (getEntity as jest.Mock).mockReturnValue(data);
      vm = new ProfileDialogGroupContentViewModel(props);
      expect(vm.destinationId).toEqual(123);
      expect(vm.analysisType).toEqual(analysisType);
    });
  });
});
