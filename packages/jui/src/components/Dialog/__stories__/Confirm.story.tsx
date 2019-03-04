/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-11 14:36:08
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiModal } from '../Modal';
import { JuiDialog } from '../Dialog';

storiesOf('Components/Dialog', module)
  .addDecorator(withInfoDecorator(JuiDialog))
  .add('JuiConfirm', () => {
    const open = boolean('open', true);
    const title = text('Title', 'Delete Post');
    const content = text('Content', 'Are you delete it?');
    const okText = text('okText', 'Delete');
    const cancelText = text('cancelText', 'Cancel');

    const ok = () => alert('ok');
    const cancel = () => alert('cancel');
    return (
      <div>
        <JuiModal
          open={open}
          title={title}
          onOK={ok}
          onCancel={cancel}
          okText={okText}
          cancelText={cancelText}
        >
          {content}
        </JuiModal>
      </div>
    );
  });
