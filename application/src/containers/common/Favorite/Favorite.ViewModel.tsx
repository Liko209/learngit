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
import { GlipTypeUtil } from 'sdk/utils';

const { GroupService } = service;

class FavoriteViewModel extends AbstractViewModel<FavoriteProps>
  implements FavoriteViewProps {
  private _groupService: service.GroupService = GroupService.getInstance();

  @observable
  isFavorite: boolean;

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

  getFavorite = async () => {
    const type = GlipTypeUtil.extractTypeId(this.id);
    const result = await this._groupService.isFavorited(this.id, type);
    this.isFavorite = result;
  }

  handlerFavorite = async (): Promise<ServiceCommonErrorType> => {
    return this._groupService.markGroupAsFavorite(this.id, !this.isFavorite);
  }
}

export { FavoriteViewModel };
