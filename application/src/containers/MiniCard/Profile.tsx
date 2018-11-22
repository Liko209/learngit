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
  div: HTMLDivElement;
  anchor: HTMLElement;

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
    document.body.appendChild(this.div);
    ReactDOM.render(
      <ThemeProvider>
        <ProfileMiniCard id={id} anchor={anchor} />
      </ThemeProvider>,
      this.div,
    );
  }

  destroy() {
    if (!this.div) {
      return;
    }
    const unmountResult = ReactDOM.unmountComponentAtNode(this.div);
    if (unmountResult && this.div.parentNode) {
      this.div.parentNode.removeChild(this.div);
    }
  }
}

// singleton
new Profile();

export { Profile };
