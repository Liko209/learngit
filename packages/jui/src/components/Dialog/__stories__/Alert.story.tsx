/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-12 13:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text } from '@storybook/addon-knobs';
import { JuiDialog } from '../Dialog';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiModal } from '../Modal';

storiesOf('Components/Dialog', module)
  .addDecorator(withInfoDecorator(JuiDialog))
  .add('JuiAlert', () => {
    const open = boolean('open', true);
    const title = text('Title', 'Title');
    const content = text('Content', 'Content');
    const okText = text('okText', 'OK');
    return (
      <div>
        <JuiModal
          open={open}
          content={content}
          okText={okText}
          title={title}
          onOK={() => alert('ok')}
        />
      </div>
    );
  });
