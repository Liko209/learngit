/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-21 08:54:25
 * Copyright © RingCentral. All rights reserved.
 */

import { Group, Person } from '../../models';
export class GroupDataHandler {
  private static _instance: GroupDataHandler | undefined = undefined;

  static getInstance() {
    if (this._instance == null) {
      this._instance = new GroupDataHandler();
    }

    return this._instance;
  }

  isThePersonGuest(group: Group, person: Person) {
    if (
      group &&
      group.guest_user_company_ids &&
      group.guest_user_company_ids.length > 0 &&
      person &&
      person.company_id !== undefined
    ) {
      return group.guest_user_company_ids.some(
        (x: number) => x === person.company_id,
      );
    }

    return false;
  }

  isThePersonAdmin(group: Group, personId: number) {
    if (group === undefined) {
      return false;
    }

    if (group.is_team === undefined) {
      return true;
    }

    let adminUserIds: number[] = [];
    if (
      group.permissions &&
      group.permissions.admin &&
      group.permissions.admin.uids.length > 0
    ) {
      adminUserIds = group.permissions.admin.uids;
    }

    return adminUserIds.some((x: number) => x === personId);
  }
}
