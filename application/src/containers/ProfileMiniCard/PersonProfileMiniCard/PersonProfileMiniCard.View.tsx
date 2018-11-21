/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { PersonProfileMiniCardViewProps } from './types';

class PersonProfileMiniCardView extends Component<
  PersonProfileMiniCardViewProps
> {
  render() {
    const { id } = this.props;
    return <div>Person: {id}</div>;
  }
}

export { PersonProfileMiniCardView };
