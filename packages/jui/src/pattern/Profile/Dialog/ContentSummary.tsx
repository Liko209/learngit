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
import { StyledAvatar } from '../../../components/Avatar';

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

  ${StyledAvatar} {
    :hover,
    :active {
      cursor: default;
      opacity: 1;
    }
  }

  ${StyledAvatar} > img {
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity};
      cursor: pointer;
    }

    &:active {
      opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    }
  }
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
  margin-top: ${spacing(3)};
`;

const JuiProfileDialogContentSummaryButton = styled('div')`
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
  margin-right: ${spacing(5)};
  &:last-child {
    margin-right: 0;
  }
  span {
    margin-right: ${spacing(2)};
  }
`;

const JuiProfileDialogContentSummaryButtonInRight = styled(
  JuiProfileDialogContentSummaryButton,
)`
  ${typography('body1')}
  color: ${primary('700')};
`;

const JuiProfileDialogContentSummaryStatus = styled('div')`
  ${typography('body1')};
  ${ellipsis()};
  color: ${grey('500')};
  margin-top: ${spacing(1)};
  && {
    .emoji-mart-emoji {
      position: relative;
      top: 50%;
      transform: translateY(10%);
    }
  }
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
  JuiProfileDialogContentSummaryButtonInRight,
};
