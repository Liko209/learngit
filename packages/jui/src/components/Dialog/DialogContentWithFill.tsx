/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 11:01:53
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import MuiDialogContent, {
  DialogContentProps as MuiDialogContentProps,
} from '@material-ui/core/DialogContent';
import styled from '../../foundation/styled-components';

type JuiDialogContentWithFillProps = MuiDialogContentProps;

const StyledDialogContent = styled(MuiDialogContent)`
  && {
    padding: 0;
  }
`;

const JuiDialogContentWithFill = (props: JuiDialogContentWithFillProps) => {
  return <StyledDialogContent {...props} />;
};

export { JuiDialogContentWithFill, JuiDialogContentWithFillProps };
