/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ProfileMiniCardPersonHeaderViewProps } from './types';

class ProfileMiniCardPersonHeaderView extends Component<
  ProfileMiniCardPersonHeaderViewProps
> {
  render() {
    const { id } = this.props;
    return <div>Person header: {id}</div>;
  }
}

export { ProfileMiniCardPersonHeaderView };
