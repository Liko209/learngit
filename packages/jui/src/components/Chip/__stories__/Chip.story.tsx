/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:39:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiChip } from '..';

import avatar from '../../Avatar/__stories__/img/avatar.jpg';
import { JuiAvatar, JuiAvatarProps } from '../../Avatar';

const Avatar = (props: JuiAvatarProps) => {
  return <JuiAvatar src={avatar} {...props} />;
};

const handleDelete = () => {};

storiesOf('Components/Chip', module)
  .addDecorator(withInfoDecorator(JuiChip, { inline: true }))
  .add('with nothing', () => {
    return <JuiChip label="Basic Chip" />;
  })
  .add('with Avatar & DeleteIcon', () => {
    return (
      <JuiChip
        label="Basic Chip"
        PersonAvatar={Avatar}
        onDelete={handleDelete}
      />
    );
  })
  .add('with Avatar', () => {
    return <JuiChip label="Basic Chip" PersonAvatar={Avatar} />;
  })
  .add('with DeleteIcon', () => {
    return <JuiChip label="Basic Chip" onDelete={handleDelete} />;
  });
