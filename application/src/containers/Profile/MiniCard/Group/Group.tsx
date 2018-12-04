/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:31:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardGroupHeader } from './Header';
import { ProfileMiniCardGroupFooter } from './Footer';

type Props = {
  id: number;
};

class ProfileMiniCardGroup extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return (
      <JuiMiniCard>
        <JuiMiniCardHeader>
          <ProfileMiniCardGroupHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter>
          <ProfileMiniCardGroupFooter id={id} />
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

export { ProfileMiniCardGroup };
