/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components';
import { Dialog } from '@/containers/Dialog';
import { ViewProps } from './types';

type Props = ViewProps & WithTranslation;

@observer
class DeleteViewComponent extends React.Component<Props> {
  private _handleDelete = () => {
    const { deletePost, t } = this.props;
    Dialog.confirm({
      title: t('message.prompt.deletePostTitle'),
      content: t('message.prompt.deletePostContent'),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK() {
        deletePost().catch((e: any) => {
          console.log(e);
        });
      },
    });
  }
  render() {
    const { disabled, t } = this.props;
    return (
      <JuiMenuItem
        onClick={this._handleDelete}
        disabled={disabled}
        icon="delete"
      >
        {t('message.action.deletePost')}
      </JuiMenuItem>
    );
  }
}

const DeleteView = withTranslation()(DeleteViewComponent);

export { DeleteView };
