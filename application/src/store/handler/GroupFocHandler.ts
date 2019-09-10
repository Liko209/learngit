/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 14:54:44
 * Copyright © RingCentral. All rights reserved.
 */

import { ISortableModelWithData } from '@/store/base';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { GroupService, Group } from 'sdk/module/group';
import { SortUtils } from 'sdk/framework/utils';
import { IdModelFocHandler } from './IdModelFocHandler';
import { IdModelFocBuilder } from './IdModelFocBuilder';
import { DisplayNameModel } from 'sdk/framework/model';
import { AccountService } from 'sdk/module/account/service';

enum GROUP_TAB_TYPE {
  ALL,
  TEAMS,
  GROUPS,
  INDIVIDUAL,
  FAVORITES,
}

class GroupFocHandler extends IdModelFocHandler {
  private _groupService: GroupService;
  private _type: GROUP_TAB_TYPE;

  constructor(type: GROUP_TAB_TYPE) {
    super();
    this._groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    this._type = type;
  }

  private get _currentUserId() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getGlipUserId();
  }

  transformFunc = (model: Group): ISortableModelWithData<DisplayNameModel> => ({
    id: model.id,
    sortValue: model.id,
    data: {
      id: model.id,
      displayName: this._groupService.getGroupName(model).toLowerCase(),
    },
  });

  sortFunc = (
    lhs: ISortableModelWithData<DisplayNameModel>,
    rhs: ISortableModelWithData<DisplayNameModel>,
  ): number => {
    return SortUtils.compareLowerCaseString(
      lhs.data!.displayName,
      rhs.data!.displayName,
    );
  };

  filterFunc = (group: Group) => {
    let isValid: boolean = false;

    isValid =
      this._groupService.isValid(group) &&
      group.members.includes(this._currentUserId);
    if (isValid) {
      switch (this._type) {
        case GROUP_TAB_TYPE.ALL:
          break;
        case GROUP_TAB_TYPE.TEAMS:
          isValid = group.is_team ? group.is_team : false;
          break;
        case GROUP_TAB_TYPE.GROUPS:
          isValid = group.is_team ? false : true;
          break;
        case GROUP_TAB_TYPE.INDIVIDUAL:
          isValid = !group.is_team && group.members.length === 2;
          break;
        case GROUP_TAB_TYPE.FAVORITES:
          break;
        default:
          break;
      }
    }

    return isValid;
  };

  protected async createFoc() {
    return IdModelFocBuilder.buildFoc(
      this._groupService.getEntitySource(),
      this.transformFunc,
      this.filterFunc,
      this.sortFunc,
    );
  }
}

export { GroupFocHandler, GROUP_TAB_TYPE };
