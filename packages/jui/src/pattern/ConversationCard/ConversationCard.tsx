/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 10:23:27
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled, { css } from '../../foundation/styled-components';
import { JuiConversationCardAvatarArea } from './ConversationCardAvatarArea';
import { grey, palette, spacing } from '../../foundation/utils';
import tinycolor from 'tinycolor2';
import {
  JuiButtonProps,
  JuiButton,
} from '../../components/Buttons/Button/Button';

type ConversationCardProps = {
  Avatar: React.ReactNode;
  children: (React.ReactChild | null)[];
  mode?: string;
  onClick?: (e: React.MouseEvent) => any;
} & React.DOMAttributes<{}>;

const StyledNavigationButton = styled<JuiButtonProps>(JuiButton)`
  && {
    opacity: 0;
    top: ${spacing(1.5)};
    left: 50%;
    transform: translate(-50%, 0);
    position: absolute;
    transition: all, 0.3s;
  }
`;

const StyledRightSection = styled('div')`
  position: relative;
  flex-grow: 1;
  min-width: 0;
  width: 100%;
`;

const navigationStyles = ({ mode }: { mode?: string }) =>
  mode === 'navigation' &&
  css`
    position: relative;
    cursor: pointer;
    &:hover {
      ${StyledNavigationButton} {
        opacity: 1;
      }
    }
    &.highlight {
      background: ${({ theme }) =>
        tinycolor(palette('semantic', 'critical')({ theme }))
          .setAlpha(theme.palette.action.hoverOpacity)
          .toRgbString()};
    }
  `;

const StyledConversationCard = styled<{ mode?: string }, 'div'>('div')`
  background-color: white;
  display: flex;
  transition: background-color 0.2s ease-in;
  &:hover,
  &:focus {
    background: ${grey('50')};
  }
  ${navigationStyles}
`;

const JuiConversationCard = ({
  children,
  Avatar,
  ...rest
}: ConversationCardProps) => (
  <StyledConversationCard {...rest}>
    <StyledNavigationButton variant="round">
      Jump to conversation
    </StyledNavigationButton>
    <JuiConversationCardAvatarArea>{Avatar}</JuiConversationCardAvatarArea>
    <StyledRightSection>{children}</StyledRightSection>
  </StyledConversationCard>
);

export { JuiConversationCard };
export default JuiConversationCard;
