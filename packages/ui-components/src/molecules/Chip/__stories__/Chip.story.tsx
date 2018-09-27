/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:39:52
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../utils/decorators';

import JuiChip from '..';

import avatar from '../../../atoms/Avatar/__stories__/img/avatar.jpg';
import JuiAvatar, { TJuiAvatarProps } from '../../../atoms/Avatar';

const Avatar = (props: TJuiAvatarProps) => {
  return <JuiAvatar src={avatar} {...props} />;
};

const handleDelete = () => {};

storiesOf('Molecules/Chip', module)
  .addDecorator(withInfoDecorator(JuiChip, { inline: true }))
  .addWithJSX('with nothing', () => {
    return <JuiChip label="Basic Chip" />;
  })
  .addWithJSX('with Avatar & DeleteIcon', () => {
    return (
      <JuiChip label="Basic Chip" Avatar={Avatar} onDelete={handleDelete} />
    );
  })
  .addWithJSX('with Avatar', () => {
    return <JuiChip label="Basic Chip" Avatar={Avatar} />;
  })
  .addWithJSX('with DeleteIcon', () => {
    return <JuiChip label="Basic Chip" onDelete={handleDelete} />;
  });
