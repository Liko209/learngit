/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:10:14
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@/containers/ThemeProvider';
import { ProfileMiniCard } from '@/containers/ProfileMiniCard';
import { MiniCardShowProfileParams } from './types';

class Profile {
  static instance: Profile;
  div: HTMLDivElement | null;
  anchor: HTMLElement | null;

  constructor() {
    if (Profile.instance instanceof Profile) {
      return Profile.instance;
    }
    Profile.instance = this;
    return this;
  }

  show({ anchor, id }: MiniCardShowProfileParams) {
    if (this.anchor === anchor) {
      return;
    }
    this.destroy();
    this.anchor = anchor;
    this.div = document.createElement('div');
    this._setPosition();
    document.body.appendChild(this.div);
    ReactDOM.render(
      <ThemeProvider>
        <ProfileMiniCard id={id} />
      </ThemeProvider>,
      this.div,
    );
  }

  private _setPosition() {
    if (!this.div || !this.anchor) {
      return;
    }
    const rect = this.anchor.getBoundingClientRect();
    const { left, top } = rect;
    this.div.setAttribute(
      'style',
      `position: absolute; left: 0; top: 0; will-change: transform; transform: translate3d(${left}px, ${top}px, 0px); z-index: 1;`,
    );
  }

  refresh() {
    this._setPosition();
  }

  destroy() {
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
new Profile();

export { Profile };
