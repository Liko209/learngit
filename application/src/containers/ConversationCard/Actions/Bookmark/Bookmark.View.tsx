/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { BookmarkViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { catchError } from '@/common/catchError';

type Props = BookmarkViewProps & WithTranslation;

@observer
class BookmarkViewComponent extends Component<Props> {
  private _handleToggleBookmark = async () => {
    const { bookmark, isBookmark } = this.props;
    await bookmark(!isBookmark);
  }

  @catchError.flash({
    network: 'message.prompt.notAbleToRemoveYourBookmarkForNetworkIssue',
    server: 'message.prompt.notAbleToRemoveYourBookmarkForServerIssue',
  })
  private _handleRemoveBookmark = () => {
    return this._handleToggleBookmark();
  }

  @catchError.flash({
    network: 'message.prompt.notAbleToBookmarkThisMessageForNetworkIssue',
    server: 'message.prompt.notAbleToBookmarkThisMessageForServerIssue',
  })
  private _handleBookmark = () => {
    return this._handleToggleBookmark();
  }

  render() {
    const { isBookmark, t } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={
          isBookmark ? t('message.action.removeBookmark') : t('message.action.bookmark')
        }
        color={isBookmark ? 'primary' : undefined}
        onClick={isBookmark ? this._handleRemoveBookmark : this._handleBookmark}
        variant="plain"
        data-name="actionBarBookmark"
      >
        {isBookmark ? 'bookmark' : 'bookmark_border'}
      </JuiIconButton>
    );
  }
}

const BookmarkView = withTranslation('translations')(BookmarkViewComponent);

export { BookmarkView };
