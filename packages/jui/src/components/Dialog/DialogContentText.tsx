/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 11:01:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import MuiDialogContentText, {
  DialogContentTextProps as MuiDialogContentTextProps,
} from '@material-ui/core/DialogContentText';
import styled from '../../foundation/styled-components';

type JuiDialogContentTextProps = MuiDialogContentTextProps;

const StyledDialogContentText = styled(MuiDialogContentText)`
  overflow-wrap: break-word;
`;

const JuiDialogContentText = memo((props: JuiDialogContentTextProps) => {
  return <StyledDialogContentText {...props} />;
});

export { JuiDialogContentText };
