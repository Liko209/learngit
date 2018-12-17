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
import { spacing } from '../../foundation/utils/styles';

type JuiDialogContentWithFillProps = MuiDialogContentProps;

const StyledDialogContent = styled(MuiDialogContent)`
  && {
    padding: ${spacing(0, 0, 6, 0)};
    display: flex;
    flex-direction: column;
  }
`;

const JuiDialogContentWithFill = (props: JuiDialogContentWithFillProps) => {
  return <StyledDialogContent {...props} />;
};

export { JuiDialogContentWithFill, JuiDialogContentWithFillProps };
