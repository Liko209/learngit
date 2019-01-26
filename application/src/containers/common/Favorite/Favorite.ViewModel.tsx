/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { service } from 'sdk';
import { Group } from 'sdk/module/group/entity';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { StoreViewModel } from '@/store/ViewModel';

import { FavoriteProps } from './types';

const { GroupService } = service;

class FavoriteViewModel extends StoreViewModel<FavoriteProps> {
  private _groupService: service.GroupService = GroupService.getInstance();

  constructor(props: FavoriteProps) {
    super(props);
    this.autorun(this.getConversationId);
  }

  @observable
  conversationId: number;

  getConversationId = async () => {
    const { id } = this.props;
    const type = GlipTypeUtil.extractTypeId(id);

    if (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    ) {
      this.conversationId = id;
      return;
    }

    if (type === TypeDictionary.TYPE_ID_PERSON) {
      const group = await this._groupService.getLocalGroup([id]);
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
  get isFavorite() {
    if (this._group) {
      return this._group.isFavorite;
    }
    return false;
  }

  handlerFavorite = () => {
    return this._groupService.markGroupAsFavorite(
      this.conversationId,
      !this.isFavorite,
    );
  }
}

export { FavoriteViewModel };
