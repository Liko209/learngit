/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { FavoriteViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { JuiModal } from '@/containers/Dialog';

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
    const { handlerFavorite, isFavorite, t } = this.props;
    const result = await handlerFavorite();
    if (result === ServiceCommonErrorType.SERVER_ERROR) {
      const content = isFavorite
        ? t('markUnFavoriteServerErrorContent')
        : t('markFavoriteServerErrorContent');
      JuiModal.alert({
        content,
        title: '',
        okText: t('OK'),
        okBtnType: 'text',
        onOK: () => {},
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
      >
        {isFavorite ? 'star' : 'star_border'}
      </JuiIconButton>
    );
  }
}

const FavoriteView = translate('translations')(FavoriteViewComponent);

export { FavoriteView };
