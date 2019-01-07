/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components';
import { Dialog } from '@/containers/Dialog';
import { ViewProps } from './types';

@observer
class DeleteView extends React.Component<ViewProps> {
  private _handleDelete = () => {
    const { deletePost } = this.props;
    Dialog.confirm({
      title: t('deletePostTitle'),
      content: t('deletePostContent'),
      okText: t('delete'),
      okType: 'negative',
      cancelText: t('Cancel'),
      onOK() {
        deletePost().catch((e: any) => {
          console.log(e);
        });
      },
    });
  }
  render() {
    const { disabled } = this.props;
    return (
      <JuiMenuItem
        onClick={this._handleDelete}
        disabled={disabled}
        icon="delete"
      >
        {t('deletePost')}
      </JuiMenuItem>
    );
  }
}

export { DeleteView };
