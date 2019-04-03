/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 13:31:15
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { grey, spacing, typography } from '../../foundation/utils/styles';
import { DialogTitleProps as MuiDialogTitleProps } from '@material-ui/core/DialogTitle';

type JuiDialogTitleWithActionProps = MuiDialogTitleProps;

const StyledDialogTitle = styled('div')`
  padding: 0;
  border-bottom: 1px solid ${grey('300')};
  display: flex;
  flex-shrink: 0;
  height: 64px;
  box-sizing: border-box;
  align-items: center;
  padding: ${spacing(5, 6)};
`;

const JuiDialogTitleWithAction = memo(
  (props: JuiDialogTitleWithActionProps) => {
    return <StyledDialogTitle {...props} />;
  },
);

const JuiDialogTitleWithActionLeft = styled('div')`
  display: inline-flex;
  ${typography('subheading2')};
`;
const JuiDialogTitleWithActionRight = styled('div')`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  && > * {
    margin-right: -${spacing(2.5)};
  }
`;

export {
  JuiDialogTitleWithActionProps,
  JuiDialogTitleWithAction,
  JuiDialogTitleWithActionLeft,
  JuiDialogTitleWithActionRight,
};
