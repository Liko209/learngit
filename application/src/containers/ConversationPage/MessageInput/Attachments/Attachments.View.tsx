/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { AttachmentsViewProps } from './types';
import {
  AttachmentList,
  ItemInfo,
} from 'jui/pattern/MessageInput/AttachmentList';
import { JuiDuplicateAlert } from 'jui/pattern/MessageInput/DuplicateAlert';
import { getFileIcon } from '@/common/getFileIcon';

@observer
class AttachmentsView extends Component<AttachmentsViewProps> {
  private _showDuplicateFilesDialogIfNeeded = () => {
    const { duplicateFiles, showDuplicateFiles } = this.props;
    if (showDuplicateFiles) {
      return (
        <JuiDuplicateAlert
          title={t('updateFiles')}
          subtitle={t('theFollowingFilesAlreadyExist')}
          footText={t('wouldYouLikeToUpdateTheExistingFileOrCreateANewOne')}
          duplicateFiles={duplicateFiles}
          onCancel={this.props.cancelDuplicateFiles}
          onCreate={this.props.uploadDuplicateFiles}
          onUpdate={this.props.updateDuplicateFiles}
        />
      );
    }
    return null;
  }

  componentWillMount() {
    this.props.reloadFiles();
  }

  componentWillUnmount() {
    this.props.cleanFiles();
    this.props.dispose();
  }

  didSelectFiles = async (files: File[]) => {
    this.props.autoUploadFiles(files);
  }

  private _resolveIcon = (item: ItemInfo) => getFileIcon(item.name);

  render() {
    const { files, cancelUploadFile } = this.props;
    return (
      <>
        <AttachmentList
          iconResolver={this._resolveIcon}
          files={files}
          removeAttachment={cancelUploadFile}
          data-test-automation-id="message-attachment-node"
        />
        {this._showDuplicateFilesDialogIfNeeded()}
      </>
    );
  }
}

export { AttachmentsView };
