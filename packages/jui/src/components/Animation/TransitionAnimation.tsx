/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:18:07
 * Copyright © RingCentral. All rights reserved.
 */

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

type ContainerProps = {
  state: TransitionStatus;
  option: AnimationOptions;
  animation: Keyframes;
};

const StyledContainer = styled('div')<ContainerProps>`
  ${({ state, option, animation }) => getStyle(state, option, animation)}
`;

type Props = TransitionAnimationProps & {
  animation: Keyframes;
} & ThemeProps;
class TransitionAnimation extends React.PureComponent<Props> {
  render() {
    const {
      mountOnEnter,
      unmountOnExit,
      onExited,
      children,
      show,
      duration,
      easing,
      onEntered,
      theme,
      animation,
      appear,
      ...rest
    } = this.props;
    return (
      <Transition
        in={show}
        timeout={theme!.transitions.duration[duration]}
        onEntered={onEntered}
        onExited={onExited}
        appear={appear}
        mountOnEnter={mountOnEnter}
        unmountOnExit={unmountOnExit}
      >
        {state => (
          <StyledContainer
            {...rest}
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

const JuiTransition = withTheme<Props>(TransitionAnimation);

export { JuiTransition };
