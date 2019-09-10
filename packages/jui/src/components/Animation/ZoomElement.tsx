/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-01 11:18:22
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { withTheme } from '../../foundation/styled-components';
import { ThemeProps } from '../../foundation/theme/theme';

type ZoomElementProps = {
  show: boolean;
  originalElement: HTMLElement | null;
  targetElement: HTMLElement;
  duration: string;
  easing: string;
  onExited?: Function;
  onEntered?: Function;
};

type Status = 'mounted' | 'entered' | 'exited';
class ZoomElementAnimation extends React.PureComponent<
  ZoomElementProps & ThemeProps
> {
  state = {
    status: 'mounted' as Status,
  };
  handleEntered = () => {
    const { targetElement, onEntered, theme, duration } = this.props;
    setTimeout(() => {
      if (targetElement) {
        targetElement.style.cssText = '';
      }
      onEntered && onEntered();
    }, theme.transitions.duration[duration]);
    this.setState({ status: 'entered' });
  };

  handleExited = () => {
    const { onExited, theme, duration, originalElement } = this.props;
    setTimeout(() => {
      originalElement && (originalElement.style.visibility = 'visible');
      onExited && onExited();
    }, theme.transitions.duration[duration]);
    this.setState({ status: 'exited' });
  };

  private _computeCssTransform(
    startPosition: ClientRect | DOMRect,
    endPosition: ClientRect | DOMRect,
    targetElement: HTMLElement,
  ) {
    const [
      elementScale,
      elementTranslateX,
      elementTranslateY,
    ] = this._getTransformInfo(targetElement);

    const originalPosition = {
      width: startPosition.width / elementScale,
      height: startPosition.height / elementScale,
      top:
        startPosition.top -
        elementTranslateY +
        0.5 * startPosition.height -
        0.5 * (startPosition.height / elementScale),
      left:
        startPosition.left -
        elementTranslateX +
        0.5 * startPosition.width -
        0.5 * (startPosition.width / elementScale),
    };

    const tX =
      endPosition.left +
      endPosition.width / 2 -
      (originalPosition.left + originalPosition.width / 2);
    const tY =
      endPosition.top +
      endPosition.height / 2 -
      (originalPosition.top + originalPosition.height / 2);

    const sX = endPosition.width / originalPosition.width;
    const sY = endPosition.height / originalPosition.height;
    return `
      transform: translate(${tX}px, ${tY}px) scale(${sX},${sY});
    `;
  }

  private _getTransformInfo(targetElement: HTMLElement) {
    const matrixStr = window.getComputedStyle(targetElement).transform;
    if (!matrixStr) {
      return [1, 0, 0];
    }
    const match = /matrix\((.+)\)/.exec(matrixStr);
    if (match) {
      const matrix = match[1].split(',').map(Number);
      return [matrix[0], matrix[4], matrix[5]];
    }
    return [1, 0, 0];
  }

  playEnterAnimation() {
    const { originalElement, targetElement } = this.props;

    if (!originalElement) {
      requestAnimationFrame(() => {
        targetElement.style.cssText = `
        opacity: 0;
      `;
        requestAnimationFrame(() => {
          targetElement.style.cssText = `
          opacity: 1;
          ${this._getTransition()}
        `;
        });
      });
      return;
    }
    const startPosition = originalElement.getBoundingClientRect();
    const endPosition = targetElement.getBoundingClientRect();
    const originalTransform = targetElement.style.transform;
    this.handleEntered();
    requestAnimationFrame(() => {
      targetElement.style.cssText = this._computeCssTransform(
        endPosition,
        startPosition,
        targetElement,
      );

      return requestAnimationFrame(() => {
        targetElement.style.cssText = `
          ${originalTransform ? originalTransform : ''};
          ${this._getTransition()}
       `;
      });
    });
  }

  playExitAnimation() {
    const { originalElement, targetElement } = this.props;
    const endPosition =
      originalElement && originalElement.getBoundingClientRect();
    const startPosition = targetElement.getBoundingClientRect();

    this.handleExited();
    if (endPosition) {
      return requestAnimationFrame(() => {
        originalElement!.style.visibility = 'hidden';
        targetElement.style.cssText = `
            ${this._computeCssTransform(
              startPosition,
              endPosition,
              targetElement,
            )};
            ${this._getTransition()}
         `;
      });
    }
    return requestAnimationFrame(() => {
      targetElement.style.cssText = `
        opacity: 0;
        ${this._getTransition()}
      `;
    });
  }

  private _getTransition() {
    const { theme, easing, duration } = this.props;
    return `
            transition: all ${theme.transitions.duration[duration]}ms
            ${theme.transitions.easing[easing]};
    `;
  }

  componentDidMount() {
    this.playEnterAnimation();
  }

  componentDidUpdate() {
    const { show } = this.props;
    if (show && this.state.status === 'mounted') {
      this.playEnterAnimation();
    } else if (!show && this.state.status !== 'exited') {
      this.playExitAnimation();
    }
  }

  render() {
    return <></>;
  }
}

const JuiZoomElement = withTheme(ZoomElementAnimation);

export {
  JuiZoomElement,
  ZoomElementProps as JuiZoomElementProps,
  ZoomElementAnimation,
};
