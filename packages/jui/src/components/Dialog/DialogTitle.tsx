import MuiDialogTitle, {
  DialogTitleProps as MuiDialogTitleProps,
} from '@material-ui/core/DialogTitle';
import React, { memo } from 'react';

type JuiDialogTitleProps = MuiDialogTitleProps;

const JuiDialogTitle = memo((props: JuiDialogTitleProps) => {
  return <MuiDialogTitle {...props} classes={{ root: 'root' }} />;
});

export { JuiDialogTitle, JuiDialogTitleProps };
