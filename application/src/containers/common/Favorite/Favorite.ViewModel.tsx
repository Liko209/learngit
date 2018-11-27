/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { AbstractViewModel } from '@/base';
import { FavoriteProps, FavoriteViewProps } from './types';
import { service } from 'sdk';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

const { GroupService } = service;

class FavoriteViewModel extends AbstractViewModel<FavoriteProps>
  implements FavoriteViewProps {
  private _groupService: service.GroupService = GroupService.getInstance();

  @observable
  conversationId: number;

  @computed
  get _id() {
    return this.props.id; // personId || conversationId
  }

  @computed
  get isAction() {
    return !!this.props.isAction;
  }

  @computed
  get hideUnFavorite() {
    return !!this.props.hideUnFavorite;
  }

  @computed
  get size(): IconButtonSize {
    return this.props.size || 'small';
  }

  @computed
  get variant(): IconButtonVariant {
    return this.isAction ? 'round' : 'plain';
  }

  getFavorite = async () => {
    const type = GlipTypeUtil.extractTypeId(this._id);
    if (
      type === TypeDictionary.TYPE_ID_GROUP ||
      type === TypeDictionary.TYPE_ID_TEAM
    ) {
      this.conversationId = this._id;
      return;
    }
    if (type === TypeDictionary.TYPE_ID_PERSON) {
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
  get isFavorite() {
    if (this._group) {
      return this._group.isFavorite;
    }
    return false;
  }

  handlerFavorite = async (): Promise<ServiceCommonErrorType> => {
    return this._groupService.markGroupAsFavorite(
      this.conversationId,
      !this.isFavorite,
    );
  }
}

export { FavoriteViewModel };
