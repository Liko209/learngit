/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { FavoriteViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { JuiModal } from '@/containers/Dialog';

type Props = FavoriteViewProps & WithNamespaces;

class FavoriteViewComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.props.getFavorite();
  }

  onClickFavorite = async () => {
    const { isAction, handlerFavorite, isFavorite, t } = this.props;
    if (!isAction) {
      return;
    }
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

  getTooltipKey = () => {
    const { isAction, isFavorite } = this.props;
    if (isAction) {
      return isFavorite ? 'setStateUnFavorites' : 'setStateFavorites';
    }
    return isFavorite ? 'currentStateFavorite' : 'currentStateUnFavorite';
  }

  render() {
    const { hideUnFavorite, isFavorite, size, variant, disableToolTip, t } = this.props;
    if (hideUnFavorite && !isFavorite) {
      return null;
    }
    return (
      <JuiIconButton
        size={size}
        variant={variant}
        className="favorite"
        color="accent.gold"
        onClick={this.onClickFavorite}
        disableToolTip={disableToolTip}
        tooltipTitle={t(this.getTooltipKey())}
      >
        {isFavorite ? 'star' : 'star_border'}
      </JuiIconButton>
    );
  }
}

const FavoriteView = translate('translations')(FavoriteViewComponent);

export { FavoriteView };
