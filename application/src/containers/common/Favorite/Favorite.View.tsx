/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { FavoriteViewProps } from './types';
import { catchError } from '@/common/catchError';
import { analyticsCollector } from '@/AnalyticsCollector';

type Props = FavoriteViewProps & WithTranslation;

@observer
class FavoriteViewComponent extends Component<Props> {
  static defaultProps: Partial<Props> = {
    size: 'small',
  };

  private _handleToggleFavorite = async () => {
    const { handlerFavorite, isFavorite } = this.props;
    analyticsCollector.addOrRemoveFavorite(
      this.props.dataTrackingProps.source,
      isFavorite ? 'removeFromFavorite' : 'favorite',
      this.props.dataTrackingProps.conversationType,
    );
    await handlerFavorite();
  };

  @catchError.flash({
    network: 'people.prompt.notAbleToUnFavoriteForNetworkIssue',
    server: 'people.prompt.notAbleToUnFavoriteForServerIssue',
  })
  private _handleRemoveFavorite = () => this._handleToggleFavorite()

  @catchError.flash({
    network: 'people.prompt.notAbleToFavoriteThisMessageForNetworkIssue',
    server: 'people.prompt.notAbleToFavoriteThisMessageForServerIssue',
  })
  private _handleFavorite = () => this._handleToggleFavorite()

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
        onClick={isFavorite ? this._handleRemoveFavorite : this._handleFavorite}
        tooltipTitle={t(tooltipKey)}
        ariaLabel={t(tooltipKey)}
        data-test-automation-id="favorite-icon"
      >
        {isFavorite ? 'star' : 'star_border'}
      </JuiIconButton>
    );
  }
}

const FavoriteView = withTranslation('translations')(FavoriteViewComponent);

export { FavoriteView };
