import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import { JuiContentLoader } from '../';

storiesOf('Pattern', module).add(
  'ContentLoader',
  withInfo('')(() => {
    return <JuiContentLoader />;
  }),
);
