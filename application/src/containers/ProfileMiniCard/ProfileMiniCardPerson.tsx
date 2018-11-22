/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:31:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardBody,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import { ProfileMiniCardPersonHeader } from './ProfileMiniCardPersonHeader';

type Props = {
  id: number;
  anchor: HTMLElement;
};

class ProfileMiniCardPerson extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { id, anchor } = this.props;
    return (
      <JuiMiniCard anchor={anchor}>
        <JuiMiniCardHeader>
          <ProfileMiniCardPersonHeader id={id}>
            header
          </ProfileMiniCardPersonHeader>
        </JuiMiniCardHeader>
        <JuiMiniCardBody>body</JuiMiniCardBody>
        <JuiMiniCardFooter>footer</JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

export { ProfileMiniCardPerson };
