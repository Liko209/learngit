/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:20
 * Copyright © RingCentral. All rights reserved.
 */

import { DialogContext } from '@/containers/Dialog';
import i18next from 'i18next';
import { JuiModal } from 'jui/components/Dialog';
import { observer } from 'mobx-react';
import React, { createRef } from 'react';
import {
  UploadRecentLogsViewModelProps,
  UploadRecentLogsViewProps,
  TaskStatus,
} from './types';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { withLoading, DefaultLoadingWithDelay } from 'jui/hoc/withLoading';

const createTeamLoading = () => (
  <DefaultLoadingWithDelay backgroundType={'mask'} size={42} />
);
const Loading = withLoading(
  (props: any) => <>{props.children}</>,
  createTeamLoading,
);

type State = {};
@observer
class UploadRecentLogsView extends React.Component<
  UploadRecentLogsViewProps & UploadRecentLogsViewModelProps,
  State
> {
  static contextType = DialogContext;

  focusInputRef = createRef<HTMLInputElement>();
  focusTimer: NodeJS.Timeout;

  constructor(
    props: UploadRecentLogsViewProps & UploadRecentLogsViewModelProps,
  ) {
    super(props);
    this.state = {};
    // turn on callback if want to block when loading.
    this.props.onSendFeedbackDone(this._onSendFeedbackDoneCallback);
  }

  private _onSendFeedbackDoneCallback = (taskStatus: TaskStatus) => {
    const isSuccess = taskStatus === TaskStatus.SUCCESS;
    Notification.flashToast({
      message: isSuccess
        ? i18next.t('feedback.sendFeedbackSuccess')
        : i18next.t('feedback.sendFeedbackFailed'),
      type: isSuccess ? ToastType.SUCCESS : ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  componentDidMount() {
    // because of modal is dynamic append body
    // so must be delay focus
    this.focusTimer = setTimeout(() => {
      const node = this.focusInputRef.current;
      if (node) {
        node.focus();
      }
    },                           300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimer);
  }

  handleSend = () => {
    this.props.sendFeedback();
    // sendingInBackground
    Notification.flashToast({
      message: i18next.t('feedback.sendingInBackground'),
      type: ToastType.INFO,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    this.onClose();
  }

  onClose = () => this.context();

  render() {
    const { handleTitleChange, handleDescChange, isLoading } = this.props;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        title={i18next.t('feedback.uploadRecentLogsDialogHeader')}
        onCancel={this.onClose}
        onOK={this.handleSend}
        okText={i18next.t('feedback.submit')}
        cancelText={i18next.t('common.dialog.cancel')}
        loading={isLoading}
      >
        <Loading loading={isLoading} alwaysComponentShow={true} delay={0}>
          <JuiTextField
            id={i18next.t('feedback.issueTitle')}
            label={i18next.t('feedback.issueTitle')}
            fullWidth={true}
            inputProps={{
              maxLength: 200,
            }}
            inputRef={this.focusInputRef}
            onChange={handleTitleChange}
          />
          <JuiTextarea
            id={i18next.t('feedback.describeYourProblemHere')}
            label={i18next.t('feedback.describeYourProblemHere')}
            inputProps={{
              maxLength: 1000,
            }}
            fullWidth={true}
            onChange={handleDescChange}
          />
        </Loading>
      </JuiModal>
    );
  }
}

const UploadRecentLogsComponent = UploadRecentLogsView;

export { UploadRecentLogsView, UploadRecentLogsComponent };
