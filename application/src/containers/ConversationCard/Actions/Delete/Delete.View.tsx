/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiMenuItem } from 'jui/components';
import { JuiModal } from '@/containers/Dialog';
import { ViewProps } from './types';

type Props = ViewProps & WithNamespaces;

@observer
class DeleteViewComponent extends React.Component<Props> {
  private _handleDelete = () => {
    const { deletePost, t } = this.props;
    JuiModal.confirm({
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
    const { t, disabled } = this.props;
    return (
      <JuiMenuItem
        onClick={this._handleDelete}
        disabled={disabled}
        icon="delete"
      >
        {t('DeletePost')}
      </JuiMenuItem>
    );
  }
}

const DeleteView = translate('Conversations')(DeleteViewComponent);

export { DeleteView };
