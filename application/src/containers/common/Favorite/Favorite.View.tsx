/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ServiceResult } from 'sdk/service/ServiceResult';
import { Profile } from 'sdk/models';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { FavoriteViewProps } from './types';

type Props = FavoriteViewProps & WithNamespaces;

@observer
class FavoriteViewComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.props.getConversationId();
  }

  onClickFavorite = async () => {
    const { handlerFavorite, isFavorite } = this.props;
    const result: ServiceResult<Profile> = await handlerFavorite();

    if (result.isErr()) {
      const message = isFavorite
        ? 'markUnFavoriteServerErrorContent'
        : 'markFavoriteServerErrorContent';

      Notification.flashToast({
        message,
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
        dismissible: false,
      });
    }
  }

  render() {
    const { conversationId, isFavorite, size, t } = this.props;
    if (!conversationId) {
      return null;
    }
    const tooltipKey = isFavorite ? 'setStateUnFavorites' : 'setStateFavorites';
    return (
      <JuiIconButton
        size={size}
        className="favorite"
        color="accent.gold"
        onClick={this.onClickFavorite}
        tooltipTitle={t(tooltipKey)}
        ariaLabel={t(tooltipKey)}
      >
        {isFavorite ? 'star' : 'star_border'}
      </JuiIconButton>
    );
  }
}

const FavoriteView = translate('translations')(FavoriteViewComponent);

export { FavoriteView };
