/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { INotificationPermission, PERMISSION } from 'sdk/pal';
import { APPLICATION } from 'sdk/service/eventKey';
import { notificationCenter } from 'sdk/service';

class Permission implements INotificationPermission {
  private _permissionCache: NotificationPermission = this.current;
  private _permissions = PERMISSION;
  private _requestPermission = async (): Promise<NotificationPermission> => {
    return new Promise(resolve => {
      const result = Notification.requestPermission(resolve);
      if (result) {
        result.then(resolve);
      }
    });
  }
  async request(): Promise<NotificationPermission> {
    const requestedPermission = await this._requestPermission();
    this.handlePermissionChange(requestedPermission);
    return requestedPermission;
  }

  get current() {
    const permission = Notification.permission;
    this.handlePermissionChange(permission);
    return permission;
  }

  get isGranted() {
    return this.current === this._permissions.GRANTED;
  }

  handlePermissionChange(permission: NotificationPermission) {
    if (this._permissionCache && permission !== this._permissionCache) {
      this._permissionCache = permission;
      notificationCenter.emit(
        APPLICATION.NOTIFICATION_PERMISSION_CHANGE,
        permission,
      );
    }
  }
}

export { Permission, PERMISSION };
