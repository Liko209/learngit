/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 14:46:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import JuiDialog, { IDialogProps } from '../../atoms/Dialog';
import JuiDialogTitle from '../../atoms/DialogTitle';
import JuiDialogContent from '../../atoms/DialogContent';
import JuiDialogActions from '../../atoms/DialogActions';
import JuiButton from '../../atoms/Button';

interface IProps extends IDialogProps {
  open: boolean;
  okText?: string;
  cancelText?: string;
  onClose(event: MouseEvent<HTMLElement>): void;
  onCancel(event: MouseEvent<HTMLElement>): void;
  header: JSX.Element | string;
  children: JSX.Element | string; // content
  disabledOk: boolean;
}

const JuiCreateTeam = ({
  open,
  header,
  okText,
  cancelText,
  onClose,
  onCancel,
  disabledOk,
  children,
}: IProps) => {
  return (
    <JuiDialog open={open} size={'medium'} scroll="paper">
      <JuiDialogTitle>{header}</JuiDialogTitle>
      <JuiDialogContent>{children}</JuiDialogContent>
      <JuiDialogActions>
        <JuiButton
          onClick={onCancel}
          color="primary"
          variant="text"
          autoFocus={true}
        >
          {cancelText || 'Cancel'}
        </JuiButton>
        <JuiButton
          onClick={onClose}
          color="primary"
          variant="contained"
          autoFocus={true}
          disabled={disabledOk}
        >
          {okText || 'Ok'}
        </JuiButton>
      </JuiDialogActions>
    </JuiDialog>
  );
};

export default JuiCreateTeam;
