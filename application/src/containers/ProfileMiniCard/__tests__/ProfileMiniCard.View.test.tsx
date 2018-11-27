/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-26 20:20:11
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { TypeDictionary } from 'sdk/utils';
import { ProfileMiniCardView } from '../ProfileMiniCard.View';
import { ProfileMiniCardGroup } from '../ProfileMiniCardGroup';
import { ProfileMiniCardPerson } from '../ProfileMiniCardPerson';

describe('Profile mini card view model', () => {
  it('should be display a team profile mini card', () => {
    const type = TypeDictionary.TYPE_ID_TEAM;
    const Wrapper = shallow(<ProfileMiniCardView id={1} type={type} />);
    expect(Wrapper.find(ProfileMiniCardGroup)).toHaveLength(1);
  });

  it('should be display a group profile mini card', () => {
    const type = TypeDictionary.TYPE_ID_GROUP;
    const Wrapper = shallow(<ProfileMiniCardView id={1} type={type} />);
    expect(Wrapper.find(ProfileMiniCardGroup)).toHaveLength(1);
  });

  it('should be display a person profile mini card', () => {
    const type = TypeDictionary.TYPE_ID_PERSON;
    const Wrapper = shallow(<ProfileMiniCardView id={1} type={type} />);
    expect(Wrapper.find(ProfileMiniCardPerson)).toHaveLength(1);
  });
});
