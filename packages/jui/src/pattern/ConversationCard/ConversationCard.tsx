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
import { createGlobalStyle } from 'styled-components';

type ConversationCardProps = {
  Avatar: React.ReactNode;
  children: (React.ReactChild | null)[];
  mode?: string;
  highlight?: boolean;
  jumpToPost?: (e: React.MouseEvent) => any;
} & React.DOMAttributes<{}>;

const StyledNavigationButton = styled<JuiButtonProps>(JuiButton)`
  && {
    opacity: 0;
    top: ${spacing(1.5)};
    left: 50%;
    transform: translate(-50%, 0);
    position: absolute;
    transition: all, 0.2s;
    z-index: ${({ theme }) => theme.zIndex.floatButton};
  }
`;

const StyledRightSection = styled('div')`
  position: relative;
  flex-grow: 1;
  min-width: 0;
  width: 100%;
`;

const navigationStyles = ({ mode }: { mode?: string }) =>
  css`
    position: relative;
    &:hover {
      ${StyledNavigationButton} {
        opacity: 1;
      }
    }
  `;

const StyledConversationCard = styled<
  { mode?: string; highlight?: boolean },
  'div'
>('div')`
  position: relative;
  background-color: ${palette('common', 'white')};
  display: flex;
  transition: background-color 0.2s ease-in;
  &:hover,
  &:focus {
    background: ${grey('50')};
  }
  ${({ mode }) => mode === 'navigation' && navigationStyles};
  }
`;
const highlightBg = ({ theme }: any) =>
  tinycolor(palette('semantic', 'critical')({ theme }))
    .setAlpha(theme.palette.action.hoverOpacity)
    .toRgbString();
const HighlightStyle = createGlobalStyle<{}>`
  .highlight {
    animation: highlight 3s cubic-bezier(0.575, 0.105, 0.835, 0.295);
    @keyframes highlight {
      from {
        background: ${highlightBg};
      }
      to {
        background: ${palette('common', 'white')};
      }
    }
  }
`;

class JuiConversationCard extends React.PureComponent<ConversationCardProps> {
  state = {
    highlight: false,
  };

  highlight = () => {
    const { highlight } = this.state;
    !highlight &&
      this.setState({ highlight: true }, () => {
        setTimeout(() => {
          this.setState({ highlight: false });
        },         3000);
      });
  }

  render() {
    const { children, Avatar, mode, jumpToPost, ...rest } = this.props;
    const { highlight } = this.state;
    return (
      <StyledConversationCard
        className={highlight ? 'highlight' : ''}
        mode={mode}
        {...rest}
      >
        {mode === 'navigation' ? (
          <StyledNavigationButton
            variant="round"
            onClick={jumpToPost}
            data-test-automation-id={'jumpToConversation'}
          >
            Jump to conversation
          </StyledNavigationButton>
        ) : null}
        <JuiConversationCardAvatarArea>{Avatar}</JuiConversationCardAvatarArea>
        <StyledRightSection>{children}</StyledRightSection>
        <HighlightStyle />
      </StyledConversationCard>
    );
  }
}

export { JuiConversationCard };
export default JuiConversationCard;
