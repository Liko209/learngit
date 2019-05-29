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
    const { t, fileName, handleDeleteFile } = this.props;
    Dialog.confirm({
      title: t('message.prompt.deleteFile'),
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
      okType: t('negative'),
      cancelText: t('common.dialog.cancel'),
      onOK() {
        handleDeleteFile();
      },
    });
  }

  render() {
    const { canDelete, t } = this.props;
    const Icon = (
      <JuiIconography iconColor={['grey', '500']} iconSize="small">
        delete
      </JuiIconography>
    );

    return (
      <JuiMenuItem
        icon={Icon}
        disabled={!canDelete}
        color="red"
        onClick={this.deleteFile}
      >
        {t('message..deleteFile')}
      </JuiMenuItem>
    );
  }
}

const FileDeleteActionView = withTranslation('translations')(
  FileDeleteActionViewComponent,
);
export { FileDeleteActionView };
