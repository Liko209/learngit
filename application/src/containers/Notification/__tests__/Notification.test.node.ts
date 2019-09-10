/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-10 09:28:34
 * Copyright © RingCentral. All rights reserved.
 */
import {
  Notification,
  NotificationProps,
  notificationData,
} from '../Notification';
import { ToastType, ToastMessageAlign } from '../../ToastWrapper/Toast/types';

describe('Notification', () => {
  describe('_showNotification', () => {
    beforeEach(() => {
      notificationData.clear();
      Notification._buffer = [];
    });
    it('should add the toast data to the array when call flashToast', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      expect(notificationData).toHaveLength(1);
    });

    it('should add to the head of array when adding new one [JPT-395]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      Notification.flashToast({ ...toastData, message: 'bbb' });
      expect(
        notificationData.findIndex(({ message }) => message === 'bbb'),
      ).toBe(0);
    });

    it('should replace original toast when message is duplicated [JPT-508]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      expect(notificationData).toHaveLength(1);
      Notification.flashToast(toastData);
      expect(notificationData).toHaveLength(1);
    });

    it('should add to buffer when already have 3 in toast array [JPT-509]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      Notification.flashToast({ ...toastData, message: 'bbb' });
      Notification.flashToast({ ...toastData, message: 'ccc' });
      expect(notificationData).toHaveLength(3);
      Notification.flashToast({ ...toastData, message: 'ddd' });
      expect(notificationData).toHaveLength(3);
      expect(Notification._buffer).toHaveLength(1);
    });

    it('should show buffered one when exists and array decreased [JPT-509]', () => {
      const toastData: NotificationProps = {
        message: 'aaa',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
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
      expect(notificationData).toHaveLength(3);
      Notification.flashToast({ ...toastData, message: 'ddd' });
      expect(notificationData).toHaveLength(3);
      expect(Notification._buffer).toHaveLength(1);
      dismiss && dismiss();
      setImmediate(() => {
        expect(Notification._buffer).toHaveLength(0);
      });
    });

    it('should call the private method by calling flashToast or flagToast', () => {
      const spy = jest.spyOn(Notification as any, '_showNotification');
      const toastData: NotificationProps = {
        message: 'aaa',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      };
      Notification.flashToast(toastData);
      expect(spy).toHaveBeenCalledTimes(1);
      Notification.flagToast(toastData);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should call the private method by calling flagWarningToast', () => {
      const spy = jest.spyOn(Notification as any, 'flagToast');
      const message: 'aaa';
      Notification.flagWarningToast(message);
      expect(spy).toHaveBeenCalledTimes(1);
      Notification.flagSuccessToast(message);
      expect(spy).toHaveBeenCalledTimes(2);
      Notification.flagErrorToast(message);
      expect(spy).toHaveBeenCalledTimes(3);
      Notification.flagInfoToast(message);
      expect(spy).toHaveBeenCalledTimes(4);
    });
  });
  describe('checkBufferAvailability', () => {
    const notification = new Notification();
    const toastData: NotificationProps = {
      message: 'aaa',
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
    };
    beforeEach(() => {
      notificationData.clear();
      Notification._buffer = [];
    });
    it('should call _showNotification if count does not reaches max', () => {
      const spy = jest.spyOn(Notification as any, '_showNotification');
      Notification.flashToast(toastData);
      expect(spy).toHaveBeenCalled();
    });
  });
});
