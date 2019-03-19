/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 13:38:49
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import portalManager from '@/common/PortalManager';

type Return = {
  dismiss: () => void;
};

type Options = {
  anchor: HTMLElement;
};

function getStyles(anchor: HTMLElement): React.CSSProperties {
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

let _timer: number;

function onBlurHandler() {
  _timer = setTimeout(() => {
    portalManager.dismissLast();
  });
}

function onFocusHandler() {
  clearTimeout(_timer);
}

class MiniCard {
  static show(component: JSX.Element, options: Options): Return {
    const Component = component;
    const { anchor } = options;
    const Comp = () => {
      return (
        <div
          style={getStyles(anchor)}
          onBlur={onBlurHandler}
          onFocus={onFocusHandler}
        >
          {Component}
        </div>
      );
    };
    const { dismiss, show } = portalManager.wrapper(Comp);
    show();
    return {
      dismiss,
    };
  }
}

export { MiniCard };
