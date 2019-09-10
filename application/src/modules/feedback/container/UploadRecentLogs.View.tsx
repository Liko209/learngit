/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:20
 * Copyright © RingCentral. All rights reserved.
 */

import { DialogContext, withEscTracking } from '@/containers/Dialog';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { observer } from 'mobx-react';
import React, { createRef } from 'react';
import {
  UploadRecentLogsViewModelProps,
  UploadRecentLogsViewProps,
  TaskStatus,
} from './types';
import { Notification, NotificationProps } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { Loading } from 'jui/hoc/withLoading';

type State = {};

type Props = UploadRecentLogsViewProps &
  UploadRecentLogsViewModelProps &
  WithTranslation;
const Modal = withEscTracking(JuiModal);
@observer
class UploadRecentLogsComponent extends React.Component<Props, State> {
  static contextType = DialogContext;

  focusInputRef = createRef<HTMLInputElement>();
  focusTimer: NodeJS.Timeout;
  _dismiss: (() => void) | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {};
    // turn on callback if want to block when loading.
    this.props.onSendFeedbackDone(this._onSendFeedbackDoneCallback);
  }

  private _onSendFeedbackDoneCallback = (taskStatus: TaskStatus) => {
    const { t } = this.props;
    const isSuccess = taskStatus === TaskStatus.SUCCESS;
    this._flashToast({
      message: isSuccess
        ? t('feedback.sendFeedbackSuccess')
        : t('feedback.sendFeedbackFailed'),
      type: isSuccess ? ToastType.SUCCESS : ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  };

  private _flashToast(props: NotificationProps) {
    this._dismiss && this._dismiss();
    const { dismiss } = Notification.flashToast(props);
    this._dismiss = dismiss;
  }

  componentDidMount() {
    // because of modal is dynamic append body
    // so must be delay focus
    this.focusTimer = setTimeout(() => {
      const node = this.focusInputRef.current;
      if (node) {
        node.focus();
      }
    }, 300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimer);
  }

  handleSend = () => {
    const { t, sendFeedback } = this.props;
    sendFeedback();

    // sendingInBackground
    this._flashToast({
      message: t('feedback.sendingInBackground'),
      type: ToastType.INFO,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
    this.onClose();
  };

  onClose = () => this.context();

  render() {
    const { handleTitleChange, handleDescChange, isLoading, t } = this.props;
    return (
      <Modal
        open
        size={'medium'}
        title={t('feedback.uploadRecentLogsDialogHeader')}
        onCancel={this.onClose}
        onOK={this.handleSend}
        okText={t('feedback.submit')}
        cancelText={t('common.dialog.cancel')}
        loading={isLoading}
      >
        <Loading loading={isLoading} alwaysComponentShow delay={0}>
          <JuiTextField
            id={t('feedback.issueTitle')}
            label={t('feedback.issueTitle')}
            fullWidth
            inputProps={{
              maxLength: 200,
            }}
            inputRef={this.focusInputRef}
            onChange={handleTitleChange}
          />
          <JuiTextarea
            id={t('feedback.describeYourProblemHere')}
            label={t('feedback.describeYourProblemHere')}
            inputProps={{
              maxLength: 1000,
            }}
            fullWidth
            onChange={handleDescChange}
          />
        </Loading>
      </Modal>
    );
  }
}

// const UploadRecentLogsComponent = UploadRecentLogsView;

const UploadRecentLogsView = withTranslation('translations')(
  UploadRecentLogsComponent,
);

export { UploadRecentLogsView, UploadRecentLogsComponent };
