import React from 'react';
import styled, { css, keyframes } from '../../../foundation/styled-components';

type ZoomElementAnimationProps = {
  timeout?: number;
  children: (cb: Function) => any;
  show: boolean;
  originalElement: HTMLElement | null;
  animationLength: string;
};

type TransitionStatus = 'mounting' | 'animateIn' | 'idle' | 'animateOut';

function genStyle(
  state: TransitionStatus,
  position: DOMRect | ClientRect,
  endPosition: null | DOMRect | ClientRect,
  animationLength: string,
) {
  switch (state) {
    case 'mounting': {
      return css`
        &&& > * {
          opacity: 0;
        }
      `;
    }
    case 'animateIn': {
      return css`
        &&& > * {
          animation: ${getAnimation(position, endPosition)} ${animationLength}
            linear;
        }
      `;
    }
    case 'animateOut': {
      return css`
        &&& > * {
          animation: ${getAnimation(endPosition, position)} ${animationLength}
            linear forwards;
        }
      `;
    }
    case 'idle': {
      return '';
    }
  }
}

function getAnimation(inPosition: any, outPosition: any) {
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
    startPosition: DOMRect | ClientRect;
    animationLength: string;
    endPosition: any;
  } & React.HTMLAttributes<HTMLElement>
>`
  ${({ state, startPosition: position, endPosition, animationLength }) =>
    genStyle(state, position, endPosition, animationLength)}
`;

class ZoomElementAnimation extends React.Component<ZoomElementAnimationProps> {
  state = {
    mounted: false,
    inAnimation: false,
    transitionStatus: 'mounting' as TransitionStatus,
    endPosition: null as ClientRect | DOMRect | null,
  };
  childRef: HTMLElement;

  componentDidMount() {
    this.setState({ mounted: true });
  }

  registerRef = (element: HTMLElement) => {
    if (!this.childRef && element) {
      this.childRef = element;
      this.forceUpdate();
    }
  }

  render() {
    const { show, animationLength, children, originalElement } = this.props;
    const startPosition = originalElement!.getBoundingClientRect();
    const endPosition = this.childRef
      ? this.childRef.getBoundingClientRect()
      : null;

    let transitionStatus: TransitionStatus = this.state.mounted
      ? 'idle'
      : 'mounting';

    if (this.state.mounted && show && endPosition) {
      transitionStatus = 'animateIn';
    }

    if (this.state.mounted && !show && endPosition) {
      transitionStatus = 'animateOut';
    }

    return (
      <StyledAnimation
        state={transitionStatus}
        startPosition={startPosition}
        endPosition={endPosition}
        animationLength={animationLength}
      >
        {children(this.registerRef)}
      </StyledAnimation>
    );
  }
}

export { ZoomElementAnimation, ZoomElementAnimationProps };
