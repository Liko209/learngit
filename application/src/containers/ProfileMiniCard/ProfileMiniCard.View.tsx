/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ProfileMiniCardViewProps } from './types';
import { ProfileMiniCardGroup } from './ProfileMiniCardGroup';
import { ProfileMiniCardPerson } from './ProfileMiniCardPerson';
import { TypeDictionary } from 'sdk/utils';

const MappingComponent = {
  [TypeDictionary.TYPE_ID_PERSON]: ProfileMiniCardPerson,
  [TypeDictionary.TYPE_ID_GROUP]: ProfileMiniCardGroup,
  [TypeDictionary.TYPE_ID_TEAM]: ProfileMiniCardGroup,
};

const factory = (type: number, id: number) => {
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
