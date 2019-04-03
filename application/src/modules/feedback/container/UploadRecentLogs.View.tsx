/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:20
 * Copyright © RingCentral. All rights reserved.
 */

import { DialogContext } from '@/containers/Dialog';
import i18next from 'i18next';
import { JuiModal } from 'jui/components/Dialog';
import { observer } from 'mobx-react';
import React from 'react';
import {
  UploadRecentLogsViewModelProps,
  UploadRecentLogsViewProps,
} from './types';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type State = {};
@observer
class UploadRecentLogsView extends React.Component<
  UploadRecentLogsViewProps & UploadRecentLogsViewModelProps,
  State
> {
  static contextType = DialogContext;

  constructor(
    props: UploadRecentLogsViewProps & UploadRecentLogsViewModelProps,
  ) {
    super(props);
    this.state = {};
  }

  onClose = () => this.context();

  handleUpload = async () => {
    const uploadResult = await this.props.uploadRecentLogs();
    let isSuccess = true;
    let message = '';
    if (uploadResult) {
      const openResult = this.props.openEmail(
        'Jupiter Feedback',
        escape(
          `${i18next.t('feedback.describeYourProblemHere')}:\n\n\n---\nID: [${
            uploadResult.handle
          }](${uploadResult.url})\nFile: ${uploadResult.filename}\n`,
        ),
      );
      isSuccess = openResult;
      message = openResult
        ? i18next.t('feedback.uploadLogSuccess')
        : i18next.t('feedback.openEmailFailed');
    } else {
      isSuccess = false;
      message = i18next.t('feedback.uploadLogFailed');
    }
    Notification.flashToast({
      message,
      type: isSuccess ? ToastType.SUCCESS : ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    this.onClose();
  }

  render() {
    const { isUploadingFeedback } = this.props;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        title={i18next.t('feedback.uploadRecentLogsDialogHeader')}
        onCancel={this.onClose}
        onOK={this.handleUpload}
        okText={i18next.t('feedback.upload')}
        cancelText={i18next.t('common.dialog.cancel')}
        loading={isUploadingFeedback}
      >
        {i18next.t('feedback.uploadRecentLogsDialogContent')}
      </JuiModal>
    );
  }
}

const UploadRecentLogsComponent = UploadRecentLogsView;

export { UploadRecentLogsView, UploadRecentLogsComponent };
