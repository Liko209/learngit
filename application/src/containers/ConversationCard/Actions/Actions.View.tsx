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

  private _handleBookmarkButton = async (toBookmark: boolean) => {
    const { bookmark, t } = this.props;
    try {
      await bookmark(toBookmark);
    } catch {
      this._handleError(
        toBookmark ? t('Bookmark Error') : t('Removing Bookmark Error'),
      );
    }
  }

  render() {
    const { isLike, isBookmark, t } = this.props;
    const props = {
      isLike,
      isBookmark,
      handleLikeButton: this._handleLikeButton,
      handleBookmarkButton: this._handleBookmarkButton,
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
