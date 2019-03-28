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
    const result = await this.props.uploadRecentLogs();
    if (result) {
      this.props.openEmail(
        'Jupiter Feedback',
        escape(
          `File stack url: ${result.url}\n${i18next.t(
            'feedback.describeYourProblemHere',
          )}:\n`,
        ),
      );
    }
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
        okBtnProps={{
          disabled: isUploadingFeedback,
        }}
        loading={isUploadingFeedback}
      >
        {i18next.t('feedback.uploadRecentLogsDialogContent')}
      </JuiModal>
    );
  }
}

const UploadRecentLogsComponent = UploadRecentLogsView;

export { UploadRecentLogsView, UploadRecentLogsComponent };
