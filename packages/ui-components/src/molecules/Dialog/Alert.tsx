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
  onClose(event: MouseEvent<HTMLElement>): void;
  header: JSX.Element | string;
  children: JSX.Element | string; // content
  others?: JSX.Element;
}

const Alert = ({
  open,
  size,
  header,
  okText,
  onClose,
  children,
  others,
}: IProps) => {
  return (
    <JuiDialog open={open} size={size || 'small'}>
      <JuiDialogTitle>{header}</JuiDialogTitle>
      <JuiDialogContent>
        <JuiDialogContentText>{children}</JuiDialogContentText>
        {others}
      </JuiDialogContent>
      <JuiDialogActions>
        <JuiButton
          onClick={onClose}
          color="primary"
          variant="text"
          autoFocus={true}
        >
          {okText || 'Ok'}
        </JuiButton>
      </JuiDialogActions>
    </JuiDialog>
  );
};

export default Alert;
