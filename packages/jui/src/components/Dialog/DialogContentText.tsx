/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 11:01:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiDialogContentText, { DialogContentTextProps } from '@material-ui/core/DialogContentText';

interface IProps extends DialogContentTextProps { }

const JuiDialogContentText = (props: IProps) => {
  return <MuiDialogContentText {...props} />;
};

export default JuiDialogContentText;
