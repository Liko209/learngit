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

type Props = LikeViewProps & WithNamespaces;

@observer
class LikeViewComponent extends Component<Props> {
  private _handleLikeButton = (evt: any) => {
    evt.stopPropagation();
    const { isLike, like } = this.props;
    like(!isLike);
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
      >
        thumb_up
      </JuiIconButton>
    );
  }
}

const LikeView = translate('Conversations')(LikeViewComponent);

export { LikeView };
