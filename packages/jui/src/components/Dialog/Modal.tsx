/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-10 13:34:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import { DialogActionsProps } from '@material-ui/core/DialogActions';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiDialogTitle } from './DialogTitle';
import { JuiDialogContent } from './DialogContent';
import { JuiDialogContentText } from './DialogContentText';
import { JuiDialogActions } from './DialogActions';

import { spacing } from '../../foundation/utils';
import { Omit } from '../../foundation/utils/typeHelper';
import styled from '../../foundation/styled-components';
import { JuiButton, JuiButtonProps, JuiButtonColor } from '../Buttons/Button';

const StyledActions = styled<DialogActionsProps>(JuiDialogActions)`
  & button,
  & a {
    display: inline-block;
    margin-left: ${spacing(2)};
  }
`;

type JuiModalProps = {
  open?: boolean;
  size?: JuiDialogProps['size'];
  modalProps?: Object;
  title: string | JSX.Element;
  footer?: string | JSX.Element;
  automationId?: string;
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
  onCancel?(event?: React.MouseEvent): void;
  content?: string | JSX.Element;
  fillContent?: boolean;
  loading?: boolean;
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
      automationId,
    } = this.props;
    return (
      <>
        {cancelText ? (
          <JuiButton
            onClick={onCancel}
            color="primary"
            variant={cancelVariant}
            data-test-automation-id={`${automationId}DialogCancelButton`}
            autoFocus={false}
            disabled={loading}
            {...cancelBtnProps}
          >
            {cancelText}
          </JuiButton>
        ) : null}
        <JuiButton
          onClick={onOK}
          color={okType}
          variant={okVariant}
          autoFocus={false}
          data-test-automation-id={`${automationId}DialogOKButton`}
          disabled={loading}
          {...okBtnProps}
          loading={loading}
        >
          {okText}
        </JuiButton>
      </>
    );
  }

  renderContent() {
    const { children, content } = this.props;

    const renderString = (type: string | React.ReactNode) => {
      return typeof type === 'string' ? (
        <JuiDialogContentText>{type}</JuiDialogContentText>
      ) : (
        type
      );
    };

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
      automationId,
    } = this.props;

    return (
      <JuiDialog
        open={open!}
        size={size}
        {...modalProps}
        data-test-automation-id={`${automationId}DialogContainer`}
      >
        {typeof title === 'string' ? (
          <JuiDialogTitle
            data-test-automation-id={`${automationId}DialogTitle`}
          >
            {title}
          </JuiDialogTitle>
        ) : (
          title
        )}
        {contentBefore}
        <JuiDialogContent
          data-test-automation-id={`${automationId}DialogContent`}
          fill={fillContent}
        >
          {this.renderContent()}
        </JuiDialogContent>
        {contentAfter}
        <StyledActions
          className="modal-actions"
          data-test-automation-id={`${automationId}DialogActions`}
        >
          {footer ? footer : this.renderDefaultFooter()}
        </StyledActions>
      </JuiDialog>
    );
  }
}

export { JuiModal, JuiModalProps, JuiDialogFuncProps };
