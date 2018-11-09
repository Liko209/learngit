/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ActionsViewProps } from './types';
import { JuiModal } from '@/containers/Dialog';
import { JuiConversationActionBar } from 'jui/pattern/ConversationActionBar';

type Props = ActionsViewProps & WithNamespaces;

@observer
class ActionsViewComponent extends Component<Props> {
  private _handleError(content: string) {
    const { t, isOffline } = this.props;
    JuiModal.alert({
      title: '',
      content: isOffline ? t('Network Error') : content,
      okText: t('conversationMenuItem:OK'),
      okBtnType: 'text',
      onOK: () => {},
    });
  }

  private _handleLike = async () => {
    const { like, t } = this.props;
    try {
      await like();
    } catch {
      this._handleError(t('Like Error'));
    }
  }

  private _handleUnlike = async () => {
    const { unlike, t } = this.props;
    try {
      await unlike();
    } catch {
      this._handleError(t('Unlike Error'));
    }
  }

  private _handleBookMark = async () => {
    const { bookmark, t } = this.props;
    try {
      await bookmark();
    } catch {
      this._handleError(t('Bookmark Error'));
    }
  }

  private _handleRemoveBookmark = async () => {
    const { removeBookmark, t } = this.props;
    try {
      await removeBookmark();
    } catch {
      this._handleError(t('Removing Bookmark Error'));
    }
  }

  render() {
    const { isLike, isBookmark, t } = this.props;
    const props = {
      isLike,
      isBookmark,
      handleLike: this._handleLike,
      handleUnlike: this._handleUnlike,
      handleBookmark: this._handleBookMark,
      handleRemoveBookmark: this._handleRemoveBookmark,
      likeTooltipTitle: t('Like'),
      unlikeTooltipTitle: t('Unlike'),
      bookmarkTooltipTitle: t('Bookmark'),
      removeBookmarkTooltipTitle: t('Remove bookmark'),
      moreTooltipTitle: t('More'),
    };
    return <JuiConversationActionBar {...props} />;
  }
}

const ActionsView = translate('Conversations')(ActionsViewComponent);

export { ActionsView };
