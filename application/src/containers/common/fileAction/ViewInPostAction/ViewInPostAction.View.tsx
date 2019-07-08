/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { ViewInPostActionViewProps } from './types';
import { withTranslation } from 'react-i18next';
import { JuiIconography } from 'jui/foundation/Iconography';
import { action } from 'mobx';

class ViewInPostActionViewComponent extends Component<
  ViewInPostActionViewProps
> {
  _Icon = (
    <JuiIconography iconColor={['grey', '500']} iconSize='small'>
      chat_bubble
    </JuiIconography>
  );

  @action
  viewInPost = () => {
    this.props.viewInPost();
  };

  render() {
    const { t } = this.props;
    return (
      <JuiMenuItem
        icon={this._Icon}
        onClick={this.viewInPost}
        data-test-automation-id={'viewInPost'}
      >
        {t('message.fileAction.viewInPost')}
      </JuiMenuItem>
    );
  }
}

const ViewInPostActionView = withTranslation('translations')(
  ViewInPostActionViewComponent,
);
export { ViewInPostActionView };
