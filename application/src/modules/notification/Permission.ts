/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
enum PERMISSION {
  GRANTED = 'granted',
  DEFAULT = 'default',
  DENIED = 'denied',
}

export class Permission {
  private _permissions = PERMISSION;
  async request() {
    const currentPermission = this.current;
    const permissionAlreadySet =
      currentPermission !== this._permissions.DEFAULT;
    if (permissionAlreadySet) {
      return currentPermission;
    }
    return Notification.requestPermission();
  }
  get current() {
    return Notification.permission;
  }

  get isGranted() {
    return this.current === this._permissions.GRANTED;
  }
}
