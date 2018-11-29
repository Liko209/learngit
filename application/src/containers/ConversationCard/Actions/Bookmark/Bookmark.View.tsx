/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { BookmarkViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = BookmarkViewProps & WithNamespaces;

@observer
class BookmarkViewComponent extends Component<Props> {
  private _handleClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    const { isBookmark, bookmark } = this.props;
    bookmark(!isBookmark);
  }

  render() {
    const { isBookmark, t } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={isBookmark ? t('Remove bookmark') : t('Bookmark')}
        color={isBookmark ? 'primary' : undefined}
        onClick={this._handleClick}
        variant="plain"
      >
        {isBookmark ? 'bookmark' : 'bookmark_border'}
      </JuiIconButton>
    );
  }
}

const BookmarkView = translate('Conversations')(BookmarkViewComponent);

export { BookmarkView };
