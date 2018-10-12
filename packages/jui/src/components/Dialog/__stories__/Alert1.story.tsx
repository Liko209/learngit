import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiAlert } from '../Alert1';

storiesOf('Components/Dialog 🔜', module).addWithJSX('JuiAlert', () => {
  const open = boolean('open', true);

  return (
    <div>
      <JuiAlert
        open={open}
        content={'content'}
        okText={'OK'}
        title={'title'}
        onOK={() => alert('ok')}
      />
    </div>
  );
});
