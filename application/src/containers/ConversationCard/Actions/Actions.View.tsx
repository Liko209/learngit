/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ActionsViewProps, ERROR_TYPE } from './types';
import { JuiConversationActionBar } from 'jui/pattern/ConversationActionBar';

type Props = ActionsViewProps & WithNamespaces;
type State = {
  hasError: boolean;
  errType: ERROR_TYPE;
};

@observer
class ActionsViewComponent extends Component<Props, State> {
  state = {
    hasError: false,
    errType: ERROR_TYPE.NETWORK,
  };

  componentDidCatch(error: any, info: any) {
    const { isOffline } = this.props;
    const errType = isOffline ? ERROR_TYPE.NETWORK : ERROR_TYPE.LIKE;

    this.setState({ errType, hasError: true });
  }

  render() {
    const {
      isLike,
      isBookmark,
      like,
      unlike,
      bookmark,
      removeBookmark,
      t,
    } = this.props;
    const { hasError, errType } = this.state;
    const errMsgs = {
      [ERROR_TYPE.NETWORK]: t('Network Error'),
      [ERROR_TYPE.LIKE]: t('Like Error'),
      [ERROR_TYPE.UNLIKE]: t('Unlike Error'),
      [ERROR_TYPE.BOOKMARK]: t('Bookmark Error'),
      [ERROR_TYPE.REMOVE_BOOKMARK]: t('Removing Bookmark Error'),
    };
    const props = {
      isLike,
      isBookmark,
      handleLike: like,
      handleUnlike: unlike,
      handleBookmark: bookmark,
      handleRemoveBookmark: removeBookmark,
      likeTooltipTitle: t('Like'),
      unlikeTooltipTitle: t('Unlike'),
      bookmarkTooltipTitle: t('Bookmark'),
      removeBookmarkTooltipTitle: t('Remove bookmark'),
      moreTooltipTitle: t('More'),
      errMsg: hasError ? errMsgs[errType] : '',
    };
    return <JuiConversationActionBar {...props} />;
  }
}

const ActionsView = translate('Conversations')(ActionsViewComponent);

export { ActionsView };
