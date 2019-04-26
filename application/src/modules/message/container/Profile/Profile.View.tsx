/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { PROFILE_TYPE, ProfileViewProps } from './types';
import { ProfileMiniCardPerson } from './MiniCard/Person';
import { ProfileMiniCardGroup } from './MiniCard/Group';
import { ProfileDialogPerson } from './Dialog/Person';
import { ProfileDialogGroup } from './Dialog/Group';
import { TypeDictionary } from 'sdk/utils';

const MappingComponent = {
  [PROFILE_TYPE.MINI_CARD]: {
    [TypeDictionary.TYPE_ID_PERSON]: ProfileMiniCardPerson,
    [TypeDictionary.TYPE_ID_GROUP]: ProfileMiniCardGroup,
    [TypeDictionary.TYPE_ID_TEAM]: ProfileMiniCardGroup,
  },
  [PROFILE_TYPE.DIALOG]: {
    [TypeDictionary.TYPE_ID_PERSON]: ProfileDialogPerson,
    [TypeDictionary.TYPE_ID_GROUP]: ProfileDialogGroup,
    [TypeDictionary.TYPE_ID_TEAM]: ProfileDialogGroup,
  },
};

const factory = (id: number, type: PROFILE_TYPE, typeId: number) => {
  const Component = MappingComponent[type][typeId];
  return <Component id={id} />;
};

@observer
class ProfileView extends Component<ProfileViewProps> {
  render() {
    const { id, type, typeId } = this.props;
    return factory(id, type, typeId);
  }
}

export { ProfileView };
