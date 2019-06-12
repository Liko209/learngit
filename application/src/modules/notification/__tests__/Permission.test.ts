/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-24 15:14:04
 * Copyright © RingCentral. All rights reserved.
 */
import { Permission } from '../Permission';
import { APPLICATION } from 'sdk/service/eventKey';
import { notificationCenter } from 'sdk/service';

jest.mock('sdk/service', () => {
  const mockedNotificationCenter = {
    emit: jest.fn(),
  };
  return {
    notificationCenter: mockedNotificationCenter,
  };
});

global.Notification = {
  requestPermission: jest.fn().mockReturnValue('granted'),
  permission: 'default',
};

describe('Permission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('handlePermissionChange()', () => {
    it('should call notificationCenter.emit when the new permission is not the same as the old one', () => {
      const permission = new Permission();
      permission.handlePermissionChange('granted');
      expect(notificationCenter.emit).toBeCalledWith(
        APPLICATION.NOTIFICATION_PERMISSION_CHANGE,
        'granted',
      );
    });
    it('should not call notificationCenter.emit when the new permission is the same as the old one', () => {
      global.Notification.permission = 'granted';
      const permission = new Permission();
      permission.handlePermissionChange('granted');
      expect(notificationCenter.emit).not.toBeCalled();
    });
  });
});
