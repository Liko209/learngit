import MuiDialogTitle, {
  DialogTitleProps as MuiDialogTitleProps,
} from '@material-ui/core/DialogTitle';
import React from 'react';

type JuiDialogTitleProps = MuiDialogTitleProps;

const JuiDialogTitle = (props: JuiDialogTitleProps) => {
  return <MuiDialogTitle {...props} classes={{ root: 'root' }} />;
};

export { JuiDialogTitle, JuiDialogTitleProps };
