/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import portalManager from '@/common/PortalManager';
import { ClickAwayListener } from 'jui/components/ClickAwayListener';

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
    zIndex: 1300,
  };
}

class Comp extends Component<{ anchor: HTMLElement; component: JSX.Element }> {
  private _handleClickAway = () => {
    /* eslint-disable */
    MiniCard.dismiss();
    delete MiniCard.dismiss;
  };
  render() {
    return createPortal(
      <ClickAwayListener onClickAway={this._handleClickAway}>
        <div style={getStyles(this.props.anchor)}>{this.props.component}</div>
      </ClickAwayListener>, document.body
    );
  }
}

class MiniCard {
  static dismiss: Function;
  static show(component: JSX.Element, options: Options): Return {
    const Component = component;
    const { anchor } = options;
    if (MiniCard.dismiss) {
      MiniCard.dismiss();
    }
    const { dismiss, show } = portalManager.wrapper(() => (
      <Comp anchor={anchor} component={Component} />
    ));
    show();
    MiniCard.dismiss = dismiss;
    return {
      dismiss,
    };
  }
}

export { MiniCard };
