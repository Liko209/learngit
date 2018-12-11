/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select, text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiMessageInput } from '..';
import { AttachmentItem } from '../AttachmentItem';
import { AttachmentList, ItemInfo } from '../AttachmentList';
import { DuplicateAlert } from '../DuplicateAlert';

storiesOf('Pattern/MessageInput', module)
  .addDecorator(withInfoDecorator(JuiMessageInput, { inline: true }))
  .add('MessageInput', () => {
    const onChange = () => {};
    return (
      <JuiMessageInput
        value="test"
        onChange={onChange}
        keyboardEventHandler={{}}
        error=""
      />
    );
  });

storiesOf('Pattern/MessageInput', module).add('AttachmentItem', () => {
  const status = select(
    'status',
    {
      normal: 'normal',
      loading: 'loading',
      error: 'error',
    },
    'normal',
  );
  const name = text('name', 'This is the name of attachment item');

  return (
    <div>
      <AttachmentItem name="test" status="normal" />
      <br />
      <AttachmentItem name="test" status="error" />
      <br />
      <AttachmentItem name="test" status="loading" />
      <br />
      <div>Long title example:</div>
      <AttachmentItem
        name="this is a really long title this is a really long title this is a really long title"
        status="normal"
      />
      <br />
      <div>Property test</div>
      <AttachmentItem name={name} status={status} />
    </div>
  );
});

storiesOf('Pattern/MessageInput', module).add('AttachmentList', () => {
  const removeAttachment = () => {};
  const f2 = new File(['bar'], 'f2.txt', {
    type: 'text/plain',
  });
  const f1 = new File(['bar'], 'f1.txt', {
    type: 'text/plain',
  });
  const f3 = new File(
    ['bar'],
    'This is the name of attachment itemThis is the name of attachment item.txt',
    {
      type: 'text/plain',
    },
  );
  const files = [
    { file: f1, status: 'normal' },
    { file: f2, status: 'loading' },
    { file: f3, status: 'error' },
    { file: f1, status: 'normal' },
    { file: f2, status: 'loading' },
    { file: f3, status: 'error' },
    { file: f1, status: 'normal' },
    { file: f2, status: 'loading' },
    { file: f3, status: 'error' },
    { file: f1, status: 'normal' },
    { file: f2, status: 'loading' },
    { file: f3, status: 'error' },
    { file: f1, status: 'normal' },
    { file: f2, status: 'loading' },
    { file: f3, status: 'error' },
    { file: f1, status: 'normal' },
    { file: f2, status: 'loading' },
    { file: f3, status: 'error' },
  ];
  return (
    <div>
      <AttachmentList
        files={files as ItemInfo[]}
        removeAttachment={removeAttachment}
      />
    </div>
  );
});

storiesOf('Pattern/MessageInput', module).add('DuplicateAlert', () => {
  const removeAttachment = () => {};
  const f2 = new File(['bar'], 'f2.txt', {
    type: 'text/plain',
  });
  const f1 = new File(['bar'], 'f1.txt', {
    type: 'text/plain',
  });
  const f3 = new File(
    ['bar'],
    'This is the name of attachment itemThis is the name of attachment item.txt',
    {
      type: 'text/plain',
    },
  );
  const files = [f1, f2, f3];
  const callback = (title: string) => alert(`you clicked ${title}`);
  return (
    <div>
      <DuplicateAlert
        duplicateFiles={files}
        onCancel={() => callback('cancel')}
        onCreate={() => callback('create')}
        onUpdate={() => callback('update')}
      />
    </div>
  );
});
