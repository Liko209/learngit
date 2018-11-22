/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ProfileMiniCardViewProps, PROFILE_MODEL_TYPE } from './types';
import { GroupProfileMiniCard } from './GroupProfileMiniCard';
import { ProfileMiniCardPerson } from './ProfileMiniCardPerson';

const MappingComponent = {
  [PROFILE_MODEL_TYPE.PERSON]: ProfileMiniCardPerson,
  [PROFILE_MODEL_TYPE.GROUP]: GroupProfileMiniCard,
};

const factory = (type: PROFILE_MODEL_TYPE, id: number, anchor: HTMLElement) => {
  const Component = MappingComponent[type];
  return <Component id={id} anchor={anchor} />;
};

class ProfileMiniCardView extends Component<ProfileMiniCardViewProps> {
  render() {
    const { type, id, anchor } = this.props;
    return factory(type, id, anchor);
  }
}

export { ProfileMiniCardView };
