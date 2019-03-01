import * as React from 'react';
import { Transition } from 'react-transition-group';
import styled, {
  css,
  keyframes,
  withTheme,
} from '../../../foundation/styled-components';
import { TransitionStatus } from 'react-transition-group/Transition';
import { ThemeProps } from '../../../foundation/theme/theme';
import { TransitionAnimationProps, AnimationOptions } from './types';

const slideAnimation = keyframes`
    from {
      opacity: 0;
    }
    to {
      transform: opacity: 1;
    }
`;

function getStyle(state: TransitionStatus, option: AnimationOptions) {
  switch (state) {
    case 'entering':
      return css`
        &&& > * {
          animation: ${slideAnimation}
            ${({ theme }) => theme.transitions.duration[option.duration]}ms
            ${({ theme }) => theme.transitions.easing[option.easing]};
        }
      `;
    case 'exiting':
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
  option: AnimationOptions;
}>`
  ${({ state, option }) => getStyle(state, option)}
`;

class FadeAnimation extends React.PureComponent<
  TransitionAnimationProps & ThemeProps
> {
  render() {
    const {
      onExited,
      children,
      show,
      duration,
      easing,
      onEntered,
      theme,
    } = this.props;
    return (
      <Transition
        in={show}
        appear={true}
        timeout={theme.transitions.duration[duration]}
        onEntered={onEntered}
        onExited={onExited}
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

const Fade = withTheme(FadeAnimation);

export { Fade };
