/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { LikeViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
type Props = LikeViewProps & WithNamespaces;

@observer
class LikeViewComponent extends Component<Props> {
  private _handleLikeButton = async () => {
    const { isLike, like } = this.props;
    const result = await like(!isLike);
    if (result.isFailed) {
      const message = !isLike
        ? 'SorryWeWereNotAbleToLikeTheMessage'
        : 'SorryWeWereNotAbleToUnlikeTheMessage';
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
    const { isLike, t } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={isLike ? t('Unlike') : t('Like')}
        color={isLike ? 'primary' : undefined}
        onClick={this._handleLikeButton}
        variant="plain"
        data-name="actionBarLike"
      >
        {isLike ? 'thumbup' : 'thumbup_border'}
      </JuiIconButton>
    );
  }
}

const LikeView = translate('Conversations')(LikeViewComponent);

export { LikeView };
