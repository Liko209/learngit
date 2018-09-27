/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 10:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import JuiDialog, { IDialogProps } from './Dialog';
import JuiDialogTitle from './DialogTitle';
import JuiDialogContent from './DialogContent';
import JuiDialogContentText from './DialogContentText';
import JuiDialogActions from './DialogActions';
import JuiButton from '../Buttons/Button';

interface IProps extends IDialogProps {
  open: boolean;
  okText?: string;
  closeText?: string;
  onOk(event: MouseEvent<HTMLElement>): void;
  onClose(event: MouseEvent<HTMLElement>): void;
  header: JSX.Element | string;
  children: JSX.Element | string; // content
  others?: JSX.Element;
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
    others,
  } = props;
  return (
    <JuiDialog open={open} size={size}>
      <JuiDialogTitle>{header}</JuiDialogTitle>
      <JuiDialogContent>
        <JuiDialogContentText>{children}</JuiDialogContentText>
        {others}
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
