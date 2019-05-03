/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:10:14
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@/containers/ThemeProvider';
// import { ProfileMiniCard } from '@/containers/ProfileMiniCard';
import { Profile, PROFILE_TYPE } from '../Profile';
import { MiniCardShowProfileParams } from './types';

class ProfileMiniCard {
  static instance: ProfileMiniCard;
  div: HTMLDivElement | null;
  anchor: HTMLElement | null;

  constructor() {
    if (ProfileMiniCard.instance instanceof ProfileMiniCard) {
      return ProfileMiniCard.instance;
    }
    ProfileMiniCard.instance = this;
    return this;
  }

  show({ anchor, id }: MiniCardShowProfileParams) {
    // if (this.anchor === anchor) {
    //   return;
    // }
    this.dismiss();
    this.anchor = anchor;
    this.div = document.createElement('div');
    this._setPosition();
    document.body.appendChild(this.div);
    ReactDOM.render(
      <ThemeProvider>
        <Profile id={id} type={PROFILE_TYPE.MINI_CARD} />
      </ThemeProvider>,
      this.div,
    );
  }

  private _setPosition() {
    if (!this.div || !this.anchor) {
      return;
    }
    const OFFSET_LEFT = 20;
    const OFFSET_TOP = 16;
    const CONSTANT_WIDTH = 288;
    const CONSTANT_HEIGHT = 146;
    const anchorRect = this.anchor.getBoundingClientRect();
    let { left, top } = anchorRect;
    left = left - OFFSET_LEFT;
    top = top - OFFSET_TOP;

    const { clientHeight, clientWidth } = document.body;

    let y = `top: ${top}px;`;
    if (top + CONSTANT_HEIGHT > clientHeight) {
      const bottom =
        clientHeight - anchorRect.top - anchorRect.height - OFFSET_TOP;
      y = `bottom: ${bottom}px`;
    }

    let x = `left: ${left}px;`;
    if (left + CONSTANT_WIDTH > clientWidth) {
      const right =
        clientWidth - anchorRect.left - anchorRect.width - OFFSET_LEFT;
      x = `right: ${right}px`;
    }

    this.div.setAttribute(
      'style',
      `position: absolute; ${x}; ${y}; z-index: 1500;`,
    );
  }

  refresh() {
    this._setPosition();
  }

  dismiss() {
    if (!this.div) {
      return;
    }
    const unmountResult = ReactDOM.unmountComponentAtNode(this.div);
    if (unmountResult && this.div.parentNode) {
      this.div.parentNode.removeChild(this.div);
    }
    this.div = null;
    this.anchor = null;
  }
}

// singleton
new ProfileMiniCard();

export { ProfileMiniCard };
