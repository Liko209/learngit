/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:03
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { AttachmentsViewProps, AttachmentsProps } from './types';
import {
  AttachmentList,
  ItemInfo,
} from 'jui/pattern/MessageInput/AttachmentList';
import { JuiDuplicateAlert } from 'jui/pattern/MessageInput/DuplicateAlert';
import { getFileIcon } from '@/common/getFileIcon';
import { postParser } from '@/common/postParser';
import { JuiGrid } from 'jui/foundation/Layout/Grid';
import { JuiButton } from 'jui/components/Buttons';

@observer
class AttachmentsViewComponent extends Component<
  AttachmentsViewProps & WithTranslation & AttachmentsProps
> {
  private _showDuplicateFilesDialogIfNeeded = () => {
    const { duplicateFiles, showDuplicateFiles } = this.props;
    if (showDuplicateFiles) {
      const { t } = this.props;
      return (
        <JuiDuplicateAlert
          title={t('item.updateFiles')}
          subtitle={t('item.theFollowingFilesAlreadyExist')}
          footText={t(
            'item.wouldYouLikeToUpdateTheExistingFileOrCreateANewOne',
          )}
          duplicateFileNames={duplicateFiles.map(({ name }) =>
            postParser(name, { fileName: true }),
          )}
          onEscTrackedCancel={this.props.onEscTrackedCancelDuplicateFiles}
          onCancel={this.props.cancelDuplicateFiles}
          onCreate={this.props.uploadDuplicateFiles}
          onUpdate={this.props.updateDuplicateFiles}
          cancelText={t('common.dialog.cancel')}
          updateText={t('common.dialog.update')}
          createText={t('common.dialog.create')}
        />
      );
    }
    return null;
  };

  componentWillMount() {
    this.props.reloadFiles();
  }

  componentWillUnmount() {
    this.props.forceSaveDraftItems();
    this.props.cleanFiles();
    this.props.dispose();
  }

  didSelectFiles = async (files: File[]) => {
    this.props.autoUploadFiles(files);
  };

  private _resolveIcon = (item: ItemInfo) => getFileIcon(item.name);

  render() {
    const { t, files, cancelUploadFile, canPost, onPostClicked } = this.props;
    return (
      <>
        {canPost && files.length > 0 ? (
          <>
            <AttachmentList
              iconResolver={this._resolveIcon}
              files={files}
              fileNames={files.map(({ id, name }) => ({
                id,
                fileNameChildren: postParser(name, { fileName: true }),
              }))}
              removeAttachment={cancelUploadFile}
              data-test-automation-id="message-attachment-node"
            />
            <JuiGrid container justify="center">
              <JuiButton
                size="medium"
                variant="contained"
                onClick={onPostClicked}
                data-test-automation-id="post-button"
              >
                {t('message.postButton')}
              </JuiButton>
            </JuiGrid>
          </>
        ) : null}
        {this._showDuplicateFilesDialogIfNeeded()}
      </>
    );
  }
}

const AttachmentsView = withTranslation('translations')(
  AttachmentsViewComponent,
);

export { AttachmentsView };
