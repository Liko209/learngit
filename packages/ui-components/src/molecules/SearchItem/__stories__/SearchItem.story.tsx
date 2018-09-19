/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-15 13:49:14
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../utils/decorators';

import JuiSearchItem from '..';

import JuiAvatarWithPresence from '../../../molecules/AvatarWithPresence';
import JuiSearchItemText from '../../../atoms/SearchItemText';

import avatar from '../../../atoms/Avatar/__stories__/img/avatar.jpg';

const AvatarWithPresence = () => {
  return <JuiAvatarWithPresence src={avatar} presence="online" />;
};

const SearchItemText = () => {
  return <JuiSearchItemText primary="primary" secondary="secondary" />;
};

storiesOf('Molecules/SearchItem', module)
  .addDecorator(withInfoDecorator(JuiSearchItem, { inline: true }))
  .addWithJSX('with AvatarWithPresence & SearchItemText', () => {
    return (
      <JuiSearchItem>
        <AvatarWithPresence />
        <SearchItemText />
      </JuiSearchItem>
    );
  });
