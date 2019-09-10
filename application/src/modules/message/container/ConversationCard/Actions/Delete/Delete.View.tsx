/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-09 10:10:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiMenuItem } from 'jui/components/Menus';
import { Dialog } from '@/containers/Dialog';
import { ViewProps } from './types';
import { mainLogger } from 'foundation/log';

type Props = ViewProps & WithTranslation;

@observer
class DeleteViewComponent extends React.Component<Props> {
  private _handleDelete = () => {
    const { deletePost, t } = this.props;
    Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'deleteConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'deleteCancelButton' },
      title: t('message.prompt.deletePostTitle'),
      content: t('message.prompt.deletePostContent'),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK() {
        deletePost().catch((e: any) => {
          mainLogger.error(e);
        });
      },
    });
  };
  render() {
    const { disabled, t } = this.props;
    return (
      <JuiMenuItem
        onClick={this._handleDelete}
        disabled={disabled}
        icon="delete"
        data-test-automation-id="message-action-delete"
      >
        {t('message.action.deletePost')}
      </JuiMenuItem>
    );
  }
}

const DeleteView = withTranslation()(DeleteViewComponent);

export { DeleteView };
