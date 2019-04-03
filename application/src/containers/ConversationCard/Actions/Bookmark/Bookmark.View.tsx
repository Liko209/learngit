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
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = BookmarkViewProps & WithTranslation;

@observer
class BookmarkViewComponent extends Component<Props> {
  private _handleClick = async () => {
    const { isBookmark, bookmark } = this.props;
    try {
      await bookmark(!isBookmark);
    } catch (error) {
      const message = isBookmark
        ? 'message.prompt.SorryWeWereNotAbleToRemoveYourBookmark'
        : 'message.prompt.SorryWeWereNotAbleToBookmarkThisMessage';
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
    const { isBookmark, t } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={
          isBookmark
            ? t('message.action.removeBookmark')
            : t('message.action.bookmark')
        }
        color={isBookmark ? 'primary' : undefined}
        onClick={this._handleClick}
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
