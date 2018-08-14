import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { Presence } from '.';

storiesOf('Atoms/Presence', module)
  .add('online', withInfo(``)(() => <Presence status="online" />))
  .add('away', withInfo(``)(() => <Presence status="away" />))
  .add('offline', withInfo(``)(() => <Presence status="offline" />));
