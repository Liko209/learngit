/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { FileDeleteActionViewProps } from './types';
import { Dialog } from '@/containers/Dialog';
import { withTranslation, Trans } from 'react-i18next';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { observer } from 'mobx-react';
import { JuiIconography } from 'jui/foundation/Iconography';

@observer
class FileDeleteActionViewComponent extends Component<
  FileDeleteActionViewProps
> {
  deleteFile = () => {
    const { t, fileName, handleDeleteFile, beforeDelete } = this.props;
    const { startLoading, stopLoading } = Dialog.confirm({
      title: t('message.prompt.deleteFileTitle'),
      content: (
        <JuiDialogContentText>
          <Trans
            i18nKey="message.prompt.deleteFileContent"
            values={{ fileName }}
            components={[<strong key="0" />]}
          />
        </JuiDialogContentText>
      ),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      modalProps: { 'data-test-automation-id': 'confirmDeleteDialog' },
      async onOK() {
        beforeDelete && beforeDelete();
        startLoading();
        const result = await handleDeleteFile();
        stopLoading();
        return !!result;
      },
    });
  };

  iconCom = (
    <JuiIconography iconColor={['grey', '500']} iconSize="small">
      delete
    </JuiIconography>
  );

  render() {
    const { canDelete, t } = this.props;
    return (
      <JuiMenuItem
        icon={this.iconCom}
        disabled={!canDelete}
        onClick={this.deleteFile}
        data-test-automation-id={'fileDeleteItem'}
      >
        {t('message.fileAction.deleteFile')}
      </JuiMenuItem>
    );
  }
}

const FileDeleteActionView = withTranslation('translations')(
  FileDeleteActionViewComponent,
);
export { FileDeleteActionView };
