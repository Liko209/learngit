/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { FavoriteProps, FavoriteViewProps } from './types';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

import { service } from 'sdk';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';

const { GroupService } = service;

class FavoriteViewModel extends AbstractViewModel<FavoriteProps>
  implements FavoriteViewProps {
  private _groupService: service.GroupService = GroupService.getInstance();

  @computed
  get id() {
    return this.props.id; // personId || conversationId
  }

  @computed
  get isAction() {
    return !!this.props.isAction;
  }

  @computed
  get size(): IconButtonSize {
    return this.props.size || 'small';
  }

  @computed
  get variant(): IconButtonVariant {
    return this.isAction ? 'round' : 'plain';
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get isFavorite() {
    return this._group.isFavorite;
  }

  handlerFavorite = async (): Promise<ServiceCommonErrorType> => {
    return this._groupService.markGroupAsFavorite(this.id, !this.isFavorite);
  }
}

export { FavoriteViewModel };
