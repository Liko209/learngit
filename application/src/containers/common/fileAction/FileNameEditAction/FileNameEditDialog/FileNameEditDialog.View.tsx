/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { RuiSuffixFollowTextField } from 'rcui/components/Forms';
import portalManager from '@/common/PortalManager';
import { JuiModal } from 'jui/components/Dialog';
import { FileNameEditDialogViewProps } from './types';

const MAX_INPUT_LENGTH = 260;
const ENTRY_KEY_CODE = 13;

@observer
class FileNameEditDialogViewComponent extends Component<
  FileNameEditDialogViewProps
> {
  state: {
    isLoading: false;
  };

  handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const { updateNewFileName } = this.props;
    updateNewFileName(value);
  }

  handleClose = () => portalManager.dismissLast();

  private _handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { newFileName } = this.props;
    if (event.keyCode === ENTRY_KEY_CODE) {
      const { handleEditFileName } = this.props;
      event.preventDefault();
      if (!newFileName) return;
      handleEditFileName();
    }
  }

  render() {
    const {
      t,
      item,
      fileNameRemoveSuffix,
      newFileName,
      handleEditFileName,
      isLoading,
    } = this.props;
    const { type } = item;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        title={t('message.prompt.editFileNameTitle')}
        onCancel={this.handleClose}
        onOK={handleEditFileName}
        okText={t('common.dialog.save')}
        cancelText={t('common.dialog.cancel')}
        loading={isLoading}
        okBtnProps={{
          disabled: newFileName !== undefined && !newFileName,
        }}
        modalProps={{
          'data-test-automation-id': 'fileNameEditDialog',
        }}
      >
        <RuiSuffixFollowTextField
          data-test-automation-id={'fileNameEditSuffixFollowTextField'}
          id={'fileNameEdit'}
          label={t('message.prompt.editFileNameInputLabel')}
          fullWidth={true}
          InputProps={{
            classes: {
              root: 'root',
            },
          }}
          defaultValue={fileNameRemoveSuffix}
          inputProps={{
            maxLength: MAX_INPUT_LENGTH,
            'data-test-automation-id': 'fileNameEditInput',
            onKeyDown: this._handleEnter,
          }}
          suffix={`.${type}`}
          onChange={this.handleTextChange}
        />
      </JuiModal>
    );
  }
}

const FileNameEditDialogView = withTranslation('translations')(
  FileNameEditDialogViewComponent,
);
export { FileNameEditDialogView };
