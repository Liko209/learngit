/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 10:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import JuiDialog, { IDialogProps } from '../../atoms/Dialog';
import JuiDialogTitle from '../../atoms/DialogTitle';
import JuiDialogContent from '../../atoms/DialogContent';
import JuiDialogContentText from '../../atoms/DialogContentText';
import JuiDialogActions from '../../atoms/DialogActions';
import JuiButton from '../../atoms/Button';

interface IProps extends IDialogProps {
  open: boolean;
  okText?: string;
  closeText?: string;
  onOk(event: MouseEvent<HTMLElement>): void;
  onClose(event: MouseEvent<HTMLElement>): void;
  header: JSX.Element | string;
  children: JSX.Element | string; // content
}

const Comfirm = (props: IProps) => {
  const {
    open = false,
    size = 'small',
    header,
    okText,
    closeText,
    onOk,
    onClose,
    children,
  } = props;
  return (
    <JuiDialog open={open} size={size}>
      <JuiDialogTitle>{header}</JuiDialogTitle>
      <JuiDialogContent>
        <JuiDialogContentText>{children}</JuiDialogContentText>
      </JuiDialogContent>
      <JuiDialogActions>
        <JuiButton
          onClick={onOk}
          color="primary"
          variant="text"
          autoFocus={true}
        >
          {okText || 'Ok'}
        </JuiButton>
        <JuiButton onClick={onClose} color="primary" variant="text">
          {closeText || 'Close'}
        </JuiButton>
      </JuiDialogActions>
    </JuiDialog>
  );
};

export default Comfirm;
