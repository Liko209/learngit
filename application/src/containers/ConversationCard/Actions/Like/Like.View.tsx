/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { LikeViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
type Props = LikeViewProps & WithTranslation;

@observer
class LikeViewComponent extends Component<Props> {
  private _handleLikeButton = async () => {
    const { isLike, like } = this.props;
    try {
      await like(!isLike);
    } catch (error) {
      const message = !isLike
        ? 'message.prompt.SorryWeWereNotAbleToLikeTheMessage'
        : 'message.prompt.SorryWeWereNotAbleToUnlikeTheMessage';
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
        tooltipTitle={
          isLike ? t('message.action.unlike') : t('message.action.like')
        }
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

const LikeView = withTranslation('translations')(LikeViewComponent);

export { LikeView };
