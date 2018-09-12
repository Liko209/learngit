/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:39:52
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { select } from '@storybook/addon-knobs/react';
import { withInfoDecorator } from '../../../utils/decorators';

import JuiChip from '..';

import avatar from '../../Avatar/__stories__/img/avatar.jpg';

const knobs = {};

const handleDelete = () => {};

storiesOf('Atoms/Chip', module)
  .addDecorator(withInfoDecorator(JuiChip, { inline: true }))
  .addWithJSX('with nothing', () => {
    return <JuiChip label="Basic Chip" />;
  })
  .addWithJSX('with Avatar & DeleteIcon', () => {
    return (
      <JuiChip
        label="Basic Chip"
        avatarUrl={avatar}
        handleDelete={handleDelete}
      />
    );
  })
  .addWithJSX('with Avatar', () => {
    return <JuiChip label="Basic Chip" avatarUrl={avatar} />;
  })
  .addWithJSX('with DeleteIcon', () => {
    return <JuiChip label="Basic Chip" handleDelete={handleDelete} />;
  });
