/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-10 09:28:34
 * Copyright © RingCentral. All rights reserved.
 */
import { Notification, NotificationProps } from './../Notification';
describe('Notification', () => {
  describe('_showNotification', () => {
    beforeEach(() => {
      Notification.data = [];
      Notification._buffer = [];
    });
    it('should add the toast data to the array when call flashToast', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      expect(Notification.data).toHaveLength(1);
    });

    it('should add to the head of array when adding new one [JPT-395]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      Notification.flashToast({ ...toastData, message: 'bbb' });
      expect(
        Notification.data.findIndex(({ message }) => message === 'bbb'),
      ).toBe(0);
    });

    it('should replace original toast when message is duplicated [JPT-508]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      expect(Notification.data).toHaveLength(1);
      Notification.flashToast(toastData);
      expect(Notification.data).toHaveLength(1);
    });

    it('should add to buffer when already have 3 in toast array [JPT-509]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      Notification.flashToast({ ...toastData, message: 'bbb' });
      Notification.flashToast({ ...toastData, message: 'ccc' });
      expect(Notification.data).toHaveLength(3);
      Notification.flashToast({ ...toastData, message: 'ddd' });
      expect(Notification.data).toHaveLength(3);
      expect(Notification._buffer).toHaveLength(1);
    });

    it('should show buffered one when exists and array decreased [JPT-509]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      Notification.flashToast({
        ...toastData,
        message: 'bbb',
      });
      const { dismiss } = Notification.flashToast({
        ...toastData,
        message: 'ccc',
      });
      expect(Notification.data).toHaveLength(3);
      Notification.flashToast({ ...toastData, message: 'ddd' });
      expect(Notification.data).toHaveLength(3);
      expect(Notification._buffer).toHaveLength(1);
      dismiss && dismiss();
      expect(Notification._buffer).toHaveLength(0);
    });

    it('should call the private method by calling flashToast or flagToast', () => {
      const spy = jest.spyOn(Notification as any, '_showNotification');
      const toastData: NotificationProps = {
        message: 'aaa',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      expect(spy).toHaveBeenCalledTimes(1);
      Notification.flagToast(toastData);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});
