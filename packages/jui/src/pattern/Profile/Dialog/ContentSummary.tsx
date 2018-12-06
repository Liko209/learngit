/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:33:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled, { css } from '../../../foundation/styled-components';
import {
  width,
  spacing,
  typography,
  grey,
  lineClamp,
  primary,
} from '../../../foundation/utils/styles';

type Props = {
  children: any;
  needEllipsis?: boolean;
};

const StyledContentSummaryName = styled<Props, 'div'>('div')`
  ${typography('subheading2')}
  color: ${grey('900')};
  ${({ needEllipsis }: Props) =>
    needEllipsis &&
    css`
      ${lineClamp(3, 18)};
    `}
`;

const JuiProfileDialogContentSummary = styled('div')`
  display: flex;
  padding: ${spacing(5, 6)};
`;
const JuiProfileDialogContentSummaryLeft = styled('div')`
  width: ${width(20)};
  margin-right: ${spacing(4)};
  flex-shrink: 0;
`;

const JuiProfileDialogContentSummaryRight = styled('div')`
  flex: 1;
`;

const JuiProfileDialogContentSummaryName = ({
  children,
  needEllipsis,
}: Props) => {
  return (
    <StyledContentSummaryName needEllipsis={needEllipsis}>
      {children}
    </StyledContentSummaryName>
  );
};

const JuiProfileDialogContentSummaryDescription = styled('div')`
  ${typography('caption1')}
  color: ${grey('500')};
  ${lineClamp(3, 12)};
  margin-top: ${spacing(1)};
`;

const JuiProfileDialogContentSummaryButtons = styled('div')`
  ${typography('body1')}
  display: flex;
  color: ${primary('700')};
  margin-top: ${spacing(2.5)};
`;

const JuiProfileDialogContentSummaryButton = styled('div')`
  display: flex;
  align-items: center;
  cursor: pointer;
  span {
    margin-right: ${spacing(2)};
  }
`;

export {
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryDescription,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
};
