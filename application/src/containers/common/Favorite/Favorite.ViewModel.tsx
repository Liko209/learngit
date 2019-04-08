/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { ProfileService } from 'sdk/module/profile';
import { Group } from 'sdk/module/group/entity';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

import { getEntity, getGlobalValue } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { StoreViewModel } from '@/store/ViewModel';
import { GLOBAL_KEYS } from '@/store/constants';
import { FavoriteProps } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class FavoriteViewModel extends StoreViewModel<FavoriteProps> {
  private _groupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );
  private _currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  @observable
  conversationId: number;

  constructor(props: FavoriteProps) {
    super(props);
    this.autorun(this.getConversationId);
  }

  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _type() {
    return GlipTypeUtil.extractTypeId(this._id);
  }

  getConversationId = async () => {
    if (
      this._type === TypeDictionary.TYPE_ID_GROUP ||
      this._type === TypeDictionary.TYPE_ID_TEAM
    ) {
      this.conversationId = this._id;
      return;
    }

    if (this._type === TypeDictionary.TYPE_ID_PERSON) {
      const group = await this._groupService.getLocalGroup([this._id]);
      if (group) {
        this.conversationId = group.id;
      } else {
        this.conversationId = 0;
      }
    }
  }

  @computed
  private get _group() {
    if (this.conversationId) {
      return getEntity<Group, GroupModel>(
        ENTITY_NAME.GROUP,
        this.conversationId,
      );
    }
    return null;
  }

  @computed
  get isMember() {
    if (this._group) {
      return (
        this._group.members && this._group.members.includes(this._currentUserId)
      );
    }
    return false;
  }

  @computed
  get isFavorite() {
    if (this._group) {
      return this._group.isFavorite;
    }
    return false;
  }

  handlerFavorite = () => {
    return ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    ).markGroupAsFavorite(this.conversationId, !this.isFavorite);
  }
}

export { FavoriteViewModel };
