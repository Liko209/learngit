/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { FileNameEditActionViewProps } from './types';
import { Dialog } from '@/containers/Dialog';
import { withTranslation } from 'react-i18next';
import { RuiSuffixFollowTextField } from 'rcui/components/Forms';
import portalManager from '@/common/PortalManager';
import { observer } from 'mobx-react';
import { JuiIconography } from 'jui/foundation/Iconography';

const MAX_INPUT_LENGTH = 260;

@observer
class FileNameEditActionViewComponent extends Component<
  FileNameEditActionViewProps
> {
  handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const { updateNewFileName } = this.props;
    updateNewFileName(value);
  }
  handleClick = () => {
    const {
      t,
      handleEditFileName,
      item,
      fileNameRemoveSuffix,
      newFileName,
    } = this.props;
    const { type } = item;
    const dialog = Dialog.confirm({
      title: t('message.prompt.editFileNameTitle'),
      content: (
        <RuiSuffixFollowTextField
          data-test-automation-id={'fileNameEditSuffixFollowTextField'}
          label={t('message.prompt.editFileNameInputLabel')}
          fullWidth={true}
          InputProps={{
            classes: {
              root: 'root',
            },
          }}
          value={newFileName}
          defaultValue={fileNameRemoveSuffix}
          inputProps={{
            maxLength: MAX_INPUT_LENGTH,
          }}
          suffix={`.${type}`}
          onChange={this.handleTextChange}
        />
      ),
      okText: t('common.dialog.save'),
      automationId: 'fileNameEdit',
      cancelText: t('common.dialog.cancel'),
      onOK: async () => {
        dialog.startLoading();
        const result = await handleEditFileName();
        dialog.stopLoading();
        if (!result) {
          return false;
        }
        dialog.dismiss();
        portalManager.dismissLast();
        return true;
      },
    });
  }

  iconCom = (
    <JuiIconography iconColor={['grey', '500']} iconSize="small">
      edit
    </JuiIconography>
  );

  render() {
    const { canEditFileName, t } = this.props;

    return (
      <JuiMenuItem
        icon={this.iconCom}
        disabled={!canEditFileName}
        color="red"
        data-test-automation-id={'fileNameEditItem'}
        onClick={this.handleClick}
      >
        {t('message.fileAction.editFileName')}
      </JuiMenuItem>
    );
  }
}

const FileNameEditActionView = withTranslation('translations')(
  FileNameEditActionViewComponent,
);
export { FileNameEditActionView };
