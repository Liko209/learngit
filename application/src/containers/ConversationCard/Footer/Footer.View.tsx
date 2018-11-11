/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { FooterViewProps } from './types';
import { JuiConversationCardFooter } from 'jui/pattern/ConversationCard';
import { JuiModal } from '@/containers/Dialog';

type Props = FooterViewProps & WithNamespaces;
@observer
class FooterViewComponent extends Component<Props> {
  private _handleError(content: string) {
    const { t, isOffline } = this.props;
    JuiModal.alert({
      title: '',
      content: isOffline ? t('Network Error') : content,
    });
  }

  private _handleLikeButton = async (toLike: boolean) => {
    const { like, t } = this.props;
    try {
      await like(toLike);
    } catch {
      this._handleError(toLike ? t('Like Error') : t('Unlike Error'));
    }
  }

  render() {
    const { isLike, likeCount, t } = this.props;

    const props = {
      isLike,
      likeCount,
      handleLikeButton: this._handleLikeButton,
      likeTooltipTitle: t('Like'),
      unlikeTooltipTitle: t('Unlike'),
    };
    return <JuiConversationCardFooter {...props} />;
  }
}

const FooterView = translate('Conversations')(FooterViewComponent);

export { FooterView };
