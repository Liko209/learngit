/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ServiceResult } from 'sdk/service/ServiceResult';
import { Profile } from 'sdk/module/profile/entity';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { FavoriteViewProps } from './types';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = FavoriteViewProps & WithNamespaces;

@observer
class FavoriteViewComponent extends Component<Props> {
  static defaultProps: Partial<Props> = {
    size: 'small',
  };

  onClickFavorite = async () => {
    const { handlerFavorite, isFavorite } = this.props;
    const result: ServiceResult<Profile> = await handlerFavorite();

    if (result.isErr()) {
      const message = isFavorite
        ? 'people.prompt.markUnFavoriteServerErrorContent'
        : 'people.prompt.markFavoriteServerErrorContent';

      Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
  }

  render() {
    const { conversationId, isMember, isFavorite, size, t } = this.props;
    if (!conversationId || !isMember) {
      // 1. not create a conversation
      // 2. not a member
      return null;
    }
    const tooltipKey = isFavorite
      ? 'people.team.removeFromFavorites'
      : 'people.team.addToFavorites';
    return (
      <JuiIconButton
        size={size}
        className="favorite"
        color="accent.gold"
        onClick={this.onClickFavorite}
        tooltipTitle={t(tooltipKey)}
        ariaLabel={t(tooltipKey)}
        data-test-automation-id="favorite-icon"
      >
        {isFavorite ? 'star' : 'star_border'}
      </JuiIconButton>
    );
  }
}

const FavoriteView = translate('translations')(FavoriteViewComponent);

export { FavoriteView };
