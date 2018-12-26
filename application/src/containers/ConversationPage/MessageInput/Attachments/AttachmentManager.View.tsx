/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { observer } from 'mobx-react';
import { AttachmentsViewProps } from './types';
import { DuplicateAlert } from 'jui/pattern/MessageInput/DuplicateAlert';
import { extractView } from 'jui/hoc/extractView';
import { t } from 'i18next';

@observer
class AttachmentManagerViewComponent extends Component<
  AttachmentsViewProps & WithNamespaces
> {
  private _showDuplicateFilesDialogIfNeeded = () => {
    const { duplicateFiles, showDuplicateFiles } = this.props;
    if (showDuplicateFiles) {
      return (
        <DuplicateAlert
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
  }

  didSelectFiles = (files: File[]) => {
    this.props.autoUploadFiles(files);
  }

  directPostFiles = async (files: File[]) => {
    await this.props.autoUploadFiles(files, this.props.sendFilesOnlyPost);
  }

  render() {
    return this._showDuplicateFilesDialogIfNeeded();
  }
}

const view = extractView<WithNamespaces & AttachmentsViewProps>(
  AttachmentManagerViewComponent,
);
const AttachmentManagerView = translate('Conversations')(view);

export { AttachmentManagerView, AttachmentManagerViewComponent };
