/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:10:14
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { ProfileMiniCard } from '../ProfileMiniCard';

class Profile {
  static instance: Profile;
  div: HTMLDivElement;
  id: number;

  constructor() {
    if (Profile.instance instanceof Profile) {
      return Profile.instance;
    }
    Profile.instance = this;
    return this;
  }

  show(id: number) {
    if (this.id === id) {
      return;
    }
    this.destroy();
    this.id = id;
    this.div = document.createElement('div');
    document.body.appendChild(this.div);
    ReactDOM.render(<ProfileMiniCard id={id} />, this.div);
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
