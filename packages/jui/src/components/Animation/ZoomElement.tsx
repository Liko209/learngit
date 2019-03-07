/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:18:22
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled, {
  css,
  keyframes,
  withTheme,
} from '../../foundation/styled-components';
import { Transition } from 'react-transition-group';
import {
  TransitionStatus,
  ExitHandler,
  EnterHandler,
} from 'react-transition-group/Transition';
import { AnimationOptions } from './types';
import { ThemeProps } from '../../foundation/theme/theme';

type ZoomElementProps = {
  children: (cb: Function) => any;
  show: boolean;
  originalElement: HTMLElement | null;
  duration: string;
  easing: string;
  onExited?: ExitHandler;
  onEntered?: EnterHandler;
};

function genStyle(
  state: TransitionStatus,
  startPosition: DOMRect | ClientRect | null,
  endPosition: null | DOMRect | ClientRect,
  option: AnimationOptions,
) {
  switch (state) {
    case 'entering': {
      return css`
        &&& > * {
          opacity: 0;
        }
      `;
    }

    case 'entered': {
      return (
        endPosition &&
        css`
          &&& > * {
            animation: ${getAnimation(startPosition, endPosition, true)}
              ${({ theme }) => theme.transitions.duration[option.duration]}ms
              ${({ theme }) => theme.transitions.easing[option.easing]};
          }
        `
      );
    }
    case 'exited': {
      return css`
        &&& > * {
          animation: ${getAnimation(endPosition, startPosition, false)}
            ${({ theme }) => theme.transitions.duration[option.duration]}ms
            ${({ theme }) => theme.transitions.easing[option.easing]} forwards;
        }
      `;
    }
    default:
      return '';
  }
}

function getAnimation(inPosition: any, outPosition: any, show: boolean) {
  if (!outPosition || !inPosition) {
    return keyframes`
      0%{
        opacity: ${show ? 0 : 1};
      }
      100%{
        opacity: ${show ? 1 : 0};
      }
    `;
  }
  return keyframes`
  0% {
    position: fix;
    top: ${inPosition.top}px;
    left: ${inPosition.left}px;
    width: ${inPosition.width}px;
    height: ${inPosition.height}px;
  }
  100% {
    position: fix;
    top: ${outPosition.top}px;
    left: ${outPosition.left}px;
    width: ${outPosition.width}px;
    height: ${outPosition.height}px;
  }
 `;
}

const StyledAnimation = styled('div')<
  {
    state: TransitionStatus;
    startPosition: DOMRect | ClientRect | null;
    endPosition: any;
    option: AnimationOptions;
  } & React.HTMLAttributes<HTMLElement>
>`
  ${({ state, startPosition, endPosition, option }) =>
    genStyle(state, startPosition, endPosition, option)}
`;

class ZoomElementAnimation extends React.PureComponent<
  ZoomElementProps & ThemeProps
> {
  childRef: HTMLElement;

  componentDidMount() {
    this.forceUpdate();
  }

  registerRef = (element: HTMLElement) => {
    if (!this.childRef && element) {
      this.childRef = element;
    }
  }

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
    const { show, duration, easing, children, originalElement } = this.props;
    const startPosition =
      originalElement && originalElement.getBoundingClientRect();
    const endPosition = this.childRef && this.childRef.getBoundingClientRect();

    return (
      <Transition
        in={show}
        timeout={0}
        onEntered={this.handleEntered}
        onExited={this.handleExited}
      >
        {state => (
          <StyledAnimation
            state={state}
            startPosition={startPosition}
            endPosition={endPosition}
            option={{ duration, easing }}
          >
            {children(this.registerRef)}
          </StyledAnimation>
        )}
      </Transition>
    );
  }
}

const JuiZoomElement = withTheme(ZoomElementAnimation);

export { JuiZoomElement, ZoomElementProps as JuiZoomElementProps };
