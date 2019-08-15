/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-18 20:21:49
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { StateService } from 'sdk/module/state';
import { Group } from 'sdk/module/group/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import StoreViewModel from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { ConversationPageProps, STATUS } from './types';
import _ from 'lodash';
import history from '@/history';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { getErrorType } from '@/common/catchError';

class ConversationPageViewModel extends StoreViewModel<ConversationPageProps> {
  private _groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );
  private _stateService = ServiceLoader.getInstance<StateService>(
    ServiceConfig.STATE_SERVICE,
  );

  @observable
  loadingStatus: STATUS = STATUS.PENDING;

  constructor(props: ConversationPageProps) {
    super(props);
    this.reaction(() => this.props.groupId, this._syncLastGroupId, {
      fireImmediately: true,
    });
  }
  private _syncLastGroupId = async (groupId: number) => {
    let group;
    let errorType;
    try {
      group = await this._groupService.getById(groupId);
    } catch (error) {
      errorType = getErrorType(error);
      group = null;
      mainLogger
        .tags('ConversationPageViewModel')
        .info(`get group ${groupId} fail:`, error);
    }
    if (!group || !this._groupService.isValid(group!)) {
      history.replace('/messages/loading', {
        errorType,
        error: true,
        params: {
          id: groupId,
        },
      });
      return;
    }
    this._readGroup(groupId);
  }

  private _throttledUpdateLastGroup = _.wrap(
    _.throttle(
      (groupId: number) => {
        this._stateService.updateLastGroup(groupId);
      },
      3000,
      { trailing: true, leading: false },
    ),
    (func, groupId: number) => func(groupId),
  );

  @computed
  private get _group() {
    return this.props.groupId
      ? getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.groupId)
      : ({} as GroupModel);
  }

  @computed
  get canPost() {
    return this._group.canPost;
  }

  private async _readGroup(groupId: number) {
    this._throttledUpdateLastGroup(groupId);
  }

  @action
  updateStatus = (status: STATUS) => {
    this.loadingStatus = status;
  }
}

export { ConversationPageViewModel };
