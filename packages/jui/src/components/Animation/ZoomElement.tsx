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
    const {
      targetElement,
      originalElement,
      onEntered,
      theme,
      duration,
    } = this.props;
    setTimeout(() => {
      if (targetElement) {
        targetElement.style.cssText = '';
      }
      originalElement && (originalElement.style.visibility = 'visible');
      onEntered && onEntered();
    },         theme.transitions.duration[duration]);
    this.setState({ status: 'entered' });
  }

  handleExited = () => {
    const { onExited, theme, duration, originalElement } = this.props;
    setTimeout(() => {
      originalElement && (originalElement.style.visibility = 'visible');
      onExited && onExited();
    },         theme.transitions.duration[duration]);
    this.setState({ status: 'exited' });
  }

  private _computePositionCssText(position: ClientRect | DOMRect) {
    return `position: fixed;
           top: ${position.top}px;
           left: ${position.left}px;
           width: ${position.width}px;
           height: ${position.height}px;
    `;
  }

  playEnterAnimation() {
    const {
      originalElement,
      targetElement,
      theme,
      duration,
      easing,
    } = this.props;

    if (!originalElement) return;
    const startPosition = originalElement.getBoundingClientRect();
    const endPosition = targetElement.getBoundingClientRect();
    this.handleEntered();
    requestAnimationFrame(() => {
      originalElement.style.visibility = 'hidden';
      targetElement.style.cssText = this._computePositionCssText(startPosition);

      if (endPosition) {
        return requestAnimationFrame(() => {
          targetElement.style.cssText = `
            ${this._computePositionCssText(endPosition)}
            transition: all ${theme.transitions.duration[duration]}ms
            ${theme.transitions.easing[easing]};
            `;
        });
      }
      return requestAnimationFrame(() => {
        targetElement.style.cssText = `
            opacity: 0;
            transition: all
            ${theme.transitions.duration[duration]}ms
            ${theme.transitions.easing[easing]};
            `;
      });
    });
  }

  playExitAnimation() {
    const {
      originalElement,
      targetElement,
      theme,
      duration,
      easing,
    } = this.props;
    const endPosition =
      originalElement && originalElement.getBoundingClientRect();
    const startPosition = targetElement.getBoundingClientRect();

    this.handleExited();
    if (endPosition && startPosition) {
      return requestAnimationFrame(() => {
        originalElement!.style.visibility = 'hidden';
        targetElement.style.cssText = this._computePositionCssText(
          startPosition,
        );

        requestAnimationFrame(() => {
          targetElement.style.cssText = `
          ${this._computePositionCssText(endPosition)}
          transition: all ${theme.transitions.duration[duration]}ms
          ${theme.transitions.easing[easing]};
        `;
        });
      });
    }
    return requestAnimationFrame(() => {
      targetElement.style.cssText = `
        opacity: 0;
          transition: all
          ${theme.transitions.duration[duration]}ms
          ${theme.transitions.easing[easing]};
          `;
    });
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

export { JuiZoomElement, ZoomElementProps as JuiZoomElementProps };
