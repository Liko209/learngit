import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiContentLoader } from '../';

storiesOf('Pattern', module).add('ContentLoader', () => {
  return <JuiContentLoader />;
});
