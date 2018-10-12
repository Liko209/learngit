/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-10 13:34:32
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiDialog, JuiDialogProps } from './Dialog';
import { JuiDialogTitle } from './DialogTitle';
import { JuiDialogContent } from './DialogContent';
import { JuiDialogContentText } from './DialogContentText';
import { JuiDialogActions } from './DialogActions';
import { DialogActionsProps } from '@material-ui/core/DialogActions';

import { spacing } from '../../foundation/utils';
import styled from '../../foundation/styled-components';
import { JuiButton, JuiButtonProps } from '../Buttons/Button';

const StyledActions = styled<DialogActionsProps>(JuiDialogActions)`
  & button {
    margin-left: ${spacing(2)};
  }
`;

type JuiModalProps = {
  open?: boolean;
  size?: JuiDialogProps['size'];
  title: string | JSX.Element;
  footer?: string | JSX.Element;
  okText?: string;
  okBtnType?: JuiButtonProps['variant'];
  cancelBtnType?: JuiButtonProps['variant'];
  cancelText?: string;
  onOK?(event?: React.MouseEvent): void;
  onCancel?(event?: React.MouseEvent): void;
  content?: string | JSX.Element;
};

type ModalFunc = (
  props: JuiModalProps,
) => {
  destroy: () => void;
};

class JuiModal extends Component<JuiModalProps, {}> {
  static alert: ModalFunc;
  static confirm: ModalFunc;

  defaultFooter() {
    const {
      onCancel,
      cancelText,
      onOK,
      okText,
      okBtnType = 'contained',
      cancelBtnType = 'text',
    } = this.props;
    return (
      <>
        {cancelText ? (
          <JuiButton
            onClick={onCancel}
            color="primary"
            variant={cancelBtnType}
            autoFocus={true}
          >
            {cancelText}
          </JuiButton>
        ) : null}
        <JuiButton
          onClick={onOK}
          color="primary"
          variant={okBtnType}
          autoFocus={true}
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
    const { open, size = 'medium', title, footer } = this.props;

    return (
      <JuiDialog open={open!} size={size}>
        {typeof title === 'string' ? (
          <JuiDialogTitle>{title}</JuiDialogTitle>
        ) : (
          title
        )}
        <JuiDialogContent>{this.renderContent()}</JuiDialogContent>
        <StyledActions>{footer ? footer : this.defaultFooter()}</StyledActions>
      </JuiDialog>
    );
  }
}

export { JuiModal, JuiModalProps };
