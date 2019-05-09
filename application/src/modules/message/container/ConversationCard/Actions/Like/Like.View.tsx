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
import { catchError } from '@/common/catchError';

type Props = LikeViewProps & WithTranslation;

@observer
class LikeViewComponent extends Component<Props> {
  private _handleToggle = async () => {
    const { isLike, like } = this.props;
    await like(!isLike);
  }

  @catchError.flash({
    network: 'message.prompt.notAbleToUnlikeForNetworkIssue',
    server: 'message.prompt.notAbleToUnlikeForServerIssue',
  })
  private _handleUnlike = () => {
    return this._handleToggle();
  }

  @catchError.flash({
    network: 'message.prompt.notAbleToLikeThisMessageForNetworkIssue',
    server: 'message.prompt.notAbleToLikeThisMessageForServerIssue',
  })
  private _handleLike = () => {
    return this._handleToggle();
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
        onClick={isLike ? this._handleUnlike : this._handleLike}
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
