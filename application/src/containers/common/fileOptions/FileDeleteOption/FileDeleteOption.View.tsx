/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { FileDeleteOptionViewProps } from './types';
import { Dialog } from '@/containers/Dialog';
import { withTranslation, Trans } from 'react-i18next';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { observer } from 'mobx-react';

@observer
class FileDeleteOptionViewComponent extends Component<
  FileDeleteOptionViewProps
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
    const { canDelete } = this.props;
    console.log('-------- [FileDeleteOption.View Log] --------');
    // @ts-ignore
    console.log(this.props.item);
    console.log('---------------- [Log End] ----------------');
    return (
      <JuiMenuItem disabled={canDelete} color="red" onClick={this.deleteFile}>
        delete
      </JuiMenuItem>
    );
  }
}

const FileDeleteOptionView = withTranslation('translations')(
  FileDeleteOptionViewComponent,
);
export { FileDeleteOptionView };
