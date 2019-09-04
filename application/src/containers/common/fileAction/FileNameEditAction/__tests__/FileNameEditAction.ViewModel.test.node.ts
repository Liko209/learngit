/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { FileNameEditActionViewModel } from '../FileNameEditAction.ViewModel';
import { ENTITY_NAME } from '@/store/constants';
import { getEntity, getGlobalValue } from '../../../../../store/utils';


jest.mock('@/containers/Notification');
jest.mock('@/utils/error');
jest.mock('../../../../../store/utils');
const userA = 1;
const userB = 2;

describe('FileNameEditActionViewModel', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('canEditFileName()', () => {
    it('should be return permissions false when itemCreator !== currentPerson and  isGuest', () => {
      const group = { isThePersonGuest: () => true };
      const vm = new FileNameEditActionViewModel();
      (getGlobalValue as jest.Mock).mockReturnValue(userA);
      (getEntity as jest.Mock).mockImplementation((key) => {
        return key === ENTITY_NAME.ITEM ? {creatorId: userB} : group
      });
      expect(vm.canEditFileName).toEqual(false);
    });
    it('should be return permissions true when current person is guest but itemCreator === currentPerson', () => {
      const group = { isThePersonGuest: () => false };
      const vm = new FileNameEditActionViewModel();
      (getGlobalValue as jest.Mock).mockReturnValue(userA);
      (getEntity as jest.Mock).mockImplementation((key) => {
        return key === ENTITY_NAME.ITEM ? {creatorId: userA} : group
      });
      expect(vm.canEditFileName).toEqual(true);
    });
    it('should be return permissions true when itemCreator !== currentPerson but not guest', () => {
      const group = { isThePersonGuest: () => true };
      const vm = new FileNameEditActionViewModel();
      (getGlobalValue as jest.Mock).mockReturnValue(userA);
      (getEntity as jest.Mock).mockImplementation((key) => {
        return key === ENTITY_NAME.ITEM ? {creatorId: userA} : group
      });
      expect(vm.canEditFileName).toEqual(true);
    });
  });
});
