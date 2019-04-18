/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, CSSProperties, RefObject, createRef } from 'react';
import portalManager from '@/common/PortalManager';

type Return = {
  dismiss: () => void;
};

type Options = {
  anchor: HTMLElement;
};

function getStyles(anchor: HTMLElement): CSSProperties {
  if (!anchor) {
    return {};
  }
  const OFFSET_LEFT = 20;
  const OFFSET_TOP = 16;
  const CONSTANT_WIDTH = 288;
  const CONSTANT_HEIGHT = 146;
  const anchorRect = anchor.getBoundingClientRect();
  let { left, top } = anchorRect;
  left = left - OFFSET_LEFT;
  top = top - OFFSET_TOP;

  const { clientHeight, clientWidth } = document.body;

  let t = `${top}px`;
  let b = 'auto';
  if (top + CONSTANT_HEIGHT > clientHeight) {
    const bottom =
      clientHeight - anchorRect.top - anchorRect.height - OFFSET_TOP;
    t = 'auto';
    b = `${bottom}px`;
  }

  let l = `${left}px`;
  let r = 'auto';
  if (left + CONSTANT_WIDTH > clientWidth) {
    const right =
      clientWidth - anchorRect.left - anchorRect.width - OFFSET_LEFT;
    l = 'auto';
    r = `${right}px`;
  }

  return {
    position: 'fixed',
    top: t,
    bottom: b,
    left: l,
    right: r,
    zIndex: 1500,
  };
}

class Comp extends Component<{ anchor: HTMLElement; component: JSX.Element }> {
  private _ref: RefObject<HTMLDivElement> = createRef();
  private _clickEventHandler = (event: MouseEvent) => {
    if (!this._ref.current || !event.target) {
      return;
    }
    if (
      !this._ref.current.contains(event.target as HTMLElement) &&
      this._ref.current !== event.target
    ) {
      portalManager.dismissLast();
    }
  }
  componentDidMount() {
    document.addEventListener('click', this._clickEventHandler);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this._clickEventHandler);
  }
  render() {
    return (
      <div style={getStyles(this.props.anchor)} ref={this._ref}>
        {this.props.component}
      </div>
    );
  }
}

class MiniCard {
  static _dismiss: Function;
  static show(component: JSX.Element, options: Options): Return {
    const Component = component;
    const { anchor } = options;
    if (this._dismiss) {
      this._dismiss();
    }
    const { dismiss, show } = portalManager.wrapper(() => (
      <Comp anchor={anchor} component={Component} />
    ));
    show();
    this._dismiss = dismiss;
    return {
      dismiss,
    };
  }
}

export { MiniCard };
