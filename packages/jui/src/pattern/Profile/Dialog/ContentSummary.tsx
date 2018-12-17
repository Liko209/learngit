/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:33:44
 * Copyright © RingCentral. All rights reserved.
 */

// import React from 'react';
import tinycolor from 'tinycolor2';
import styled, { css } from '../../../foundation/styled-components';
import {
  width,
  spacing,
  typography,
  grey,
  lineClamp,
  primary,
  ellipsis,
} from '../../../foundation/utils/styles';

type PropsName = {
  needEllipsis?: boolean;
};

type PropsSummary = {
  emphasize?: boolean;
};

const JuiProfileDialogContentSummary = styled<PropsSummary, 'div'>('div')`
  display: flex;
  padding: ${spacing(5, 6)};
  flex-direction: row;
  flex-shrink: 0;
  ${({ emphasize }: PropsSummary) =>
    emphasize &&
    css`
      background-color: ${({ theme }) =>
        tinycolor(primary('700')({ theme }))
          .setAlpha(theme.palette.action.hoverOpacity / 1.5)
          .toRgbString()};
    `}
`;

const JuiProfileDialogContentSummaryLeft = styled('div')`
  width: ${width(20)};
  margin-right: ${spacing(4)};
  flex-shrink: 0;
`;

const JuiProfileDialogContentSummaryRight = styled('div')`
  flex: 1;
  overflow: hidden;
`;

const JuiProfileDialogContentSummaryName = styled<PropsName, 'div'>('div')`
${typography('subheading2')}
color: ${grey('900')};
word-break: break-word;
${({ needEllipsis }: PropsName) =>
  needEllipsis &&
  css`
    ${lineClamp(3, 18)};
  `}
`;

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
  outline: none;
  span {
    margin-right: ${spacing(2)};
  }
`;

const JuiProfileDialogContentSummaryStatus = styled('div')`
  ${typography('body1')};
  ${ellipsis()};
  color: ${grey('500')};
`;

const JuiProfileDialogContentSummaryTitle = styled(
  JuiProfileDialogContentSummaryStatus,
)``;

export {
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryDescription,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
  JuiProfileDialogContentSummaryStatus,
  JuiProfileDialogContentSummaryTitle,
};
