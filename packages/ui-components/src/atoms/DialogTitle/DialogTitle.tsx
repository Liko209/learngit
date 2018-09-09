import MuiDialogTitle, { DialogTitleProps } from '@material-ui/core/DialogTitle';
import React from 'react';

const DialogTitle = (props: DialogTitleProps) => {
  return  <MuiDialogTitle {...props} classes={{ root: 'root' }} />;
};

export default DialogTitle;
export { DialogTitle, DialogTitleProps };
