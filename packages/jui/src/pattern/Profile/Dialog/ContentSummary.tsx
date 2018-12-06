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

const StyledContentSummary = styled('div')`
  display: flex;
`;

const StyledContentSummaryLeft = styled('div')`
  width: ${width(20)};
  margin-right: ${spacing(4)};
  flex-shrink: 0;
`;

const StyledContentSummaryRight = styled('div')`
  flex: 1;
`;

const StyledContentSummaryName = styled<Props, 'div'>('div')`
  ${typography('subheading2')}
  color: ${grey('900')};
  ${({ needEllipsis }: Props) =>
    needEllipsis &&
    css`
      ${lineClamp(3, 18)};
    `}
`;

const StyledContentSummaryDescription = styled('div')`
  ${typography('caption1')}
  color: ${grey('500')};
  ${lineClamp(3, 12)};
  margin-top: ${spacing(1)};
`;

const StyledContentSummaryButtons = styled('div')`
  ${typography('body1')}
  display: flex;
  color: ${primary('700')};
  margin-top: ${spacing(2.5)};
`;

const StyledContentSummaryButton = styled('div')`
  display: flex;
  align-items: center;
  cursor: pointer;
  span {
    margin-right: ${spacing(2)};
  }
`;

const JuiProfileDialogContentSummary = ({ children }: Props) => {
  return <StyledContentSummary>{children}</StyledContentSummary>;
};

const JuiProfileDialogContentSummaryLeft = ({ children }: Props) => {
  return <StyledContentSummaryLeft>{children}</StyledContentSummaryLeft>;
};

const JuiProfileDialogContentSummaryRight = ({ children }: Props) => {
  return <StyledContentSummaryRight>{children}</StyledContentSummaryRight>;
};

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

const JuiProfileDialogContentSummaryDescription = ({ children }: Props) => {
  return (
    <StyledContentSummaryDescription>
      {children}
    </StyledContentSummaryDescription>
  );
};

const JuiProfileDialogContentSummaryButtons = ({ children }: Props) => {
  return <StyledContentSummaryButtons>{children}</StyledContentSummaryButtons>;
};

const JuiProfileDialogContentSummaryButton = ({ children }: Props) => {
  return <StyledContentSummaryButton>{children}</StyledContentSummaryButton>;
};

export {
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryDescription,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
};
