/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ProfileMiniCardViewProps, PROFILE_MODEL_TYPE } from './types';
import { GroupProfileMiniCard } from './GroupProfileMiniCard';
import { PersonProfileMiniCard } from './PersonProfileMiniCard';

const MappingComponent = {
  [PROFILE_MODEL_TYPE.PERSON]: PersonProfileMiniCard,
  [PROFILE_MODEL_TYPE.GROUP]: GroupProfileMiniCard,
};

const factory = (type: PROFILE_MODEL_TYPE, id: number) => {
  const Component = MappingComponent[type];
  return <Component id={id} />;
};

class ProfileMiniCardView extends Component<ProfileMiniCardViewProps> {
  render() {
    const { type, id } = this.props;
    return factory(type, id);
  }
}

export { ProfileMiniCardView };
