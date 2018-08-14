import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Icon } from '.';

storiesOf('Atoms/Icon', module)
  .add('icon', withInfo(``)(() => (
    <Fragment>
      <Icon>star</Icon>
      <Icon>people</Icon>
      <Icon>keyboard_arrow_up</Icon>
      <Icon>keyboard_arrow_down</Icon>
    </Fragment>
  )));
