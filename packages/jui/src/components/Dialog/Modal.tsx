/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-10 13:34:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiDialogTitle } from './DialogTitle';
import { JuiDialogContent } from './DialogContent';
import { JuiDialogContentText } from './DialogContentText';
import { JuiDialogActions } from './DialogActions';

import { Omit } from '../../foundation/utils/typeHelper';
import { JuiButton, JuiButtonProps, JuiButtonColor } from '../Buttons/Button';

type JuiModalProps = {
  open?: boolean;
  size?: JuiDialogProps['size'];
  modalProps?: Object;
  title: string | JSX.Element;
  footer?: string | JSX.Element;
  contentBefore?: string | JSX.Element | boolean | null;
  contentAfter?: string | JSX.Element | boolean | null;
  okText?: string;
  okVariant?: JuiButtonProps['variant'];
  okType?: JuiButtonColor;
  okBtnProps?: JuiButtonProps | { [attr: string]: string };
  cancelVariant?: JuiButtonProps['variant'];
  cancelBtnProps?: JuiButtonProps | { [attr: string]: string };
  cancelText?: string;
  onOK?(event?: React.MouseEvent): void | Promise<boolean> | Promise<void>;
  onCancel?(event: React.MouseEvent): void;
  content?: string | JSX.Element;
  fillContent?: boolean;
  loading?: boolean;
  onClose?(event: React.MouseEvent, reason?: string): void;
  onEscTracking?: (reason?: string) => void;
  disableEscapeKeyDown?: boolean;
};

type JuiDialogFuncProps = { componentProps?: any } & Omit<
  JuiDialogProps,
  'open'
>;

class JuiModal extends PureComponent<JuiModalProps, {}> {
  renderDefaultFooter() {
    const {
      onCancel,
      onOK,
      cancelText,
      okText,
      okVariant = 'contained',
      okType = 'primary',
      cancelVariant = 'text',
      okBtnProps,
      cancelBtnProps,
      loading,
    } = this.props;
    return (
      <>
        {cancelText && (
          <JuiButton
            onClick={onCancel}
            color="primary"
            variant={cancelVariant}
            data-test-automation-id={'DialogCancelButton'}
            autoFocus={false}
            disabled={loading}
            {...cancelBtnProps}
          >
            {cancelText}
          </JuiButton>
        )}
        {okText && (
          <JuiButton
            onClick={onOK}
            color={okType}
            variant={okVariant}
            autoFocus={false}
            data-test-automation-id={'DialogOKButton'}
            disabled={loading}
            {...okBtnProps}
            loading={loading}
          >
            {okText}
          </JuiButton>
        )}
      </>
    );
  }

  renderContent() {
    const { children, content } = this.props;

    const renderString = (type: string | React.ReactNode) =>
      typeof type === 'string' ? (
        <JuiDialogContentText>{type}</JuiDialogContentText>
      ) : (
        type
      );

    return content ? renderString(content) : renderString(children);
  }

  render() {
    const {
      open,
      size = 'medium',
      title,
      footer,
      contentBefore,
      contentAfter,
      modalProps,
      fillContent,
      onCancel,
      onEscTracking,
      loading,
      disableEscapeKeyDown,
    } = this.props;
    const onClose = (event: React.MouseEvent, reason?: string): void => {
      if (onCancel) {
        onCancel(event);
        onEscTracking && onEscTracking(reason);
      }
    };

    return (
      <JuiDialog
        disableEscapeKeyDown={loading || disableEscapeKeyDown}
        onClose={onClose}
        open={open!}
        size={size}
        {...modalProps}
      >
        {typeof title === 'string' ? (
          <JuiDialogTitle data-test-automation-id={'DialogTitle'}>
            {title}
          </JuiDialogTitle>
        ) : (
          title
        )}
        {contentBefore}
        <JuiDialogContent
          data-test-automation-id={'DialogContent'}
          fill={fillContent}
        >
          {this.renderContent()}
        </JuiDialogContent>
        {contentAfter}
        <JuiDialogActions
          className="modal-actions"
          data-test-automation-id={'DialogActions'}
        >
          {footer ? footer : this.renderDefaultFooter()}
        </JuiDialogActions>
      </JuiDialog>
    );
  }
}

export { JuiModal, JuiModalProps, JuiDialogFuncProps };
