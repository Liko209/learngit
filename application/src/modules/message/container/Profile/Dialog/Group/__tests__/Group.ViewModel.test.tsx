/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { ProfileDialogGroupViewModel } from '../Group.ViewModel';
import { i18nP } from '@/utils/i18nT';
import { Notification } from '@/containers/Notification';

jest.mock('@/containers/Notification');
jest.mock('@/store/utils');
jest.mock('@/utils/i18nT');

const mockData = {
  displayName: 'Group name',
  isTeam: true,
  description: 'description',
};

const props = {
  id: 1,
};
let vm: ProfileDialogGroupViewModel;

describe('ProfileDialogGroupViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
    (i18nP as jest.Mock).mockReturnValue('');
    Notification.flashToast = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileDialogGroupViewModel();
    vm.getDerivedProps(props);
  });

  describe('id', () => {
    it('should be get conversation id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('member', () => {
    it('should toast error message when user has been removed from the team [JPT-2091]', () => {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.conversationPrivate',
        }),
      );
    });
  });

  describe('group', () => {
    it('should be get group entity when invoke class instance property group [JPT-405]', () => {
      expect(vm.group).toEqual(mockData);
    });

    it('should be get changed group entity when change group entity data [JPT-405]', () => {
      mockData.displayName = 'Group name 2';
      mockData.isTeam = false;
      mockData.description = 'description 2';
      expect(vm.group).toEqual(mockData);
    });
  });
});
