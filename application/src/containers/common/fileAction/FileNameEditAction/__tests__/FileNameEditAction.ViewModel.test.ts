/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { FileNameEditActionViewModel } from '../FileNameEditAction.ViewModel';
import { getEntity } from '../../../../../store/utils';
import { ItemService } from 'sdk/module/item';
import { Notification } from '@/containers/Notification';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/group', () => ({
  ItemService: jest.fn(),
}));

jest.mock('@/containers/Notification');
jest.mock('@/utils/error');
jest.mock('../../../../../store/utils');
const itemService = new ItemService();

describe('FileNameEditActionViewModel', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('canEditFileName()', () => {
    it('should be return permissions true', () => {
      const group = { isThePersonGuest: () => false };
      const vm = new FileNameEditActionViewModel();
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(vm.canEditFileName).toEqual(true);
    });
  });
});
