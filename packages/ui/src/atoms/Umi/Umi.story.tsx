import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { number, boolean } from '@storybook/addon-knobs/react';
import { Umi } from '.';

storiesOf('Atoms/Umi', module)
  .add('with knobs', withInfo(``)(
    () => {
      return (
        <Fragment>
          <Umi
            unreadCount={number('unreadCount', 10)}
            showCount={boolean('showCount', true)}
            important={boolean('important', false)}
          />
        </Fragment>
      );
    },
  ));
