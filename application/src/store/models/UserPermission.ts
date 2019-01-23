/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-22 13:35:07
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import Base from './Base';
import { UserPermission } from 'sdk/module/permission/entity';
import UserPermissionType from 'sdk/module/permission/types';

export default class UserPermissionModel extends Base<UserPermission> {
  @observable
  canCreateTeam: boolean;
  @observable
  canSendNewMessage: boolean;

  constructor(data: UserPermission) {
    super(data);
    const { permissions } = data;
    this.canCreateTeam = permissions[UserPermissionType.JUPITER_CREATE_TEAM];
    this.canSendNewMessage =
      permissions[UserPermissionType.JUPITER_SEND_NEW_MESSAGE];
  }

  static fromJS(data: UserPermission) {
    return new UserPermissionModel(data);
  }
}
