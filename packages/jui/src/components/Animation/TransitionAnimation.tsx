import * as React from 'react';
import { Transition } from 'react-transition-group';
import styled, { css, withTheme } from '../../foundation/styled-components';
import { TransitionStatus } from 'react-transition-group/Transition';
import { ThemeProps } from '../../foundation/theme/theme';
import { AnimationOptions, TransitionAnimationProps } from './types';
import { Keyframes } from 'styled-components';

function getStyle(
  state: TransitionStatus,
  option: AnimationOptions,
  animation: Keyframes,
) {
  switch (state) {
    case 'entering':
      return css`
        & > * {
          animation: ${animation}
            ${({ theme }) => theme.transitions.duration[option.duration]}ms
            ${({ theme }) => theme.transitions.easing[option.easing]};
        }
      `;
    case 'exiting':
      return css`
        & > * {
          animation: ${animation}
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
  animation: Keyframes;
}>`
  ${({ state, option, animation }) => getStyle(state, option, animation)}
`;

class TransitionAnimation extends React.PureComponent<
  TransitionAnimationProps & {
    animation: Keyframes;
  } & Partial<ThemeProps>
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
      animation,
    } = this.props;
    return (
      <Transition
        in={show}
        appear={true}
        timeout={theme!.transitions.duration[duration]}
        onEntered={onEntered}
        onExited={onExited}
      >
        {state => (
          <StyledContainer
            option={{ duration, easing }}
            state={state}
            animation={animation}
          >
            {children}
          </StyledContainer>
        )}
      </Transition>
    );
  }
}

const JuiTransition = withTheme(TransitionAnimation);

export { JuiTransition };
