/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-10 15:15:19
 * Copyright © RingCentral. All rights reserved.
 */
import { ToastWrapperViewModel } from '../ToastWrapper.ViewModel';
import { Notification, notificationData } from '../../Notification';
import { ToastProps } from '../Toast';
describe('ToastWrapper.ViewModel', () => {
  describe('constructor', () => {
    it('should get toast data from Notification', () => {
      const mockData: ToastProps[] = [{ id: 1 }, { id: 2 }] as ToastProps[];
      notificationData.push({ id: 1 }, { id: 2 });
      const vm = new ToastWrapperViewModel();
      expect(vm.toasts).toEqual(mockData);
      notificationData.push({ id: 3 });
      expect(vm.toasts).toEqual(mockData.concat({ id: 3 }));
    });
  });
});
