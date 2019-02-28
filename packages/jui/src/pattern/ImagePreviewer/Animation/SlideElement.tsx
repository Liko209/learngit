import * as React from 'react';
import { Transition } from 'react-transition-group';
import styled, {
  css,
  keyframes,
  withTheme,
} from '../../../foundation/styled-components';
import {
  TransitionStatus,
  EnterHandler,
  ExitHandler,
} from 'react-transition-group/Transition';
import { ThemeProps } from '../../../foundation/theme/theme';

type SlideElementAnimationProps = {
  children: React.ReactNode;
  show: boolean;
  duration: string;
  easing: string;
  theme: ThemeProps;
  onExited?: ExitHandler;
  onEntered?: EnterHandler;
};

const slideAnimation = keyframes`
    from {
      transform: translateY(-100%)
    }
    to {
      transform: translateY(0)
    }
`;

type Options = {
  duration: string;
  easing: string;
};

function getStyle(state: TransitionStatus, option: Options) {
  switch (state) {
    case 'entered':
      return css`
        &&& > * {
          animation: ${slideAnimation}
            ${({ theme }) => theme.transitions.duration[option.duration]}ms
            ${({ theme }) => theme.transitions.easing[option.easing]};
        }
      `;
    case 'exited':
      return css`
        &&& > * {
          animation: ${slideAnimation}
            ${({ theme }) => theme.transitions.duration[option.duration]}ms
            ${({ theme }) => theme.transitions.easing[option.easing]} reverse
            forwards;
        }
      `;
    default:
      return '';
  }
}

const StyledContainer = styled('div')<{
  state: TransitionStatus;
  option: Options;
}>`
  ${({ state, option }) => getStyle(state, option)}
`;

class SlideElement extends React.PureComponent<
  SlideElementAnimationProps & ThemeProps
> {
  handleEntered = (node: HTMLElement, isAppearing: boolean) => {
    const { onEntered, theme, duration } = this.props;
    setTimeout(() => {
      onEntered && onEntered(node, isAppearing);
    },         theme.transitions.duration[duration]);
  }

  handleExited = (node: HTMLElement) => {
    const { onExited, theme, duration } = this.props;
    setTimeout(() => {
      onExited && onExited(node);
    },         theme.transitions.duration[duration]);
  }

  render() {
    const { children, show, duration, easing, onEntered } = this.props;
    return (
      <Transition
        in={show}
        appear={true}
        timeout={0}
        onEntered={onEntered}
        onExited={this.handleExited}
      >
        {state => (
          <StyledContainer option={{ duration, easing }} state={state}>
            {children}
          </StyledContainer>
        )}
      </Transition>
    );
  }
}

const SlideElementAnimation = withTheme(SlideElement);

export { SlideElementAnimation };
