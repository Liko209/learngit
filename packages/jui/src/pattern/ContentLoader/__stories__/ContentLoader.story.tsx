import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import { JuiContentLoader } from '../';

storiesOf('Organisms', module).addWithJSX(
  'ContentLoader',
  withInfo('')(() => {
    return <JuiContentLoader />;
  }),
);
