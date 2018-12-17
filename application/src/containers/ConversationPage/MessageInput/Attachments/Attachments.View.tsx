/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { observer } from 'mobx-react';
import { AttachmentsViewProps } from './types';
import { AttachmentList } from 'jui/pattern/MessageInput/AttachmentList';
import { DuplicateAlert } from 'jui/pattern/MessageInput/DuplicateAlert';

@observer
class AttachmentsViewComponent extends Component<
  AttachmentsViewProps & WithNamespaces
> {
  private _showDuplicateFilesDialogIfNeeded = () => {
    const { duplicateFiles, showDuplicateFiles, t } = this.props;
    if (showDuplicateFiles) {
      return (
        <DuplicateAlert
          title={t('Update Files?')}
          subtitle={t('The following files already exist.')}
          footText={t(
            'Do you want to update the existing files or do you wish to create new files?',
          )}
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
  }

  didSelectFiles = (files: File[]) => {
    this.props.autoUploadFiles(files);
  }

  render() {
    const { files, cancelUploadFile } = this.props;
    return (
      <>
        <AttachmentList
          files={files}
          removeAttachment={cancelUploadFile}
          data-test-automation-id="message-attachment-node"
        />
        {this._showDuplicateFilesDialogIfNeeded()}
      </>
    );
  }
}

const AttachmentsView = translate('Conversations')(AttachmentsViewComponent);

export { AttachmentsView };
