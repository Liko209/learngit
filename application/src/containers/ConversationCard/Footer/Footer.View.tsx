/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { FooterViewProps, ERROR_TYPE } from './types';
import { JuiConversationCardFooter } from 'jui/pattern/ConversationCard';

type Props = FooterViewProps & WithNamespaces;

@observer
class FooterViewComponent extends Component<Props> {
  render() {
    const {
      isLike,
      likeCount,
      like,
      unlike,
      errType,
      hasError,
      t,
    } = this.props;
    const errMsgs = {
      [ERROR_TYPE.NETWORK]: t('Network Error'),
      [ERROR_TYPE.LIKE]: t('Like Error'),
      [ERROR_TYPE.UNLIKE]: t('Unlike Error'),
    };
    const props = {
      isLike,
      likeCount,
      handleLike: like,
      handleUnlike: unlike,
      likeTooltipTitle: t('Like'),
      unlikeTooltipTitle: t('Unlike'),
      errMsg: hasError ? errMsgs[errType] : '',
    };
    return <JuiConversationCardFooter {...props} />;
  }
}

const FooterView = translate('Conversations')(FooterViewComponent);

export { FooterView };
