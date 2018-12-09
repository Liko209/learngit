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
  private _handleClick = () => {
    const { bookmark } = this.props;
    bookmark();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={t('Edit')}
        onClick={this._handleClick}
        variant="plain"
        data-name="actionBarBookmark"
      >
        'edit'
      </JuiIconButton>
    );
  }
}

const BookmarkView = translate('Conversations')(BookmarkViewComponent);

export { BookmarkView };
