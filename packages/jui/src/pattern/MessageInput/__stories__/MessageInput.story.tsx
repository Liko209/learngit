/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-13 15:50:01
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, number, select, text } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiMessageInput } from '..';
import { AttachmentItem, ITEM_STATUS } from '../AttachmentItem';
import { AttachmentList, ItemInfo } from '../AttachmentList';
import { DuplicateAlert } from '../DuplicateAlert';
import { MessageActionBar } from '../MessageActionBar';
import { AttachmentView } from '../Attachment';

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

storiesOf('Pattern/MessageInput', module).add('Attachment Button', () => {
  const autoUploadFile = () => {};
  return (
    <div>
      <MessageActionBar>
        <AttachmentView onFileChanged={autoUploadFile} />
      </MessageActionBar>
    </div>
  );
});

storiesOf('Pattern/MessageInput', module).add('AttachmentItem', () => {
  const value = number('value', 0);
  const name = text('name', 'This is the name of attachment item');

  return (
    <div>
      <AttachmentItem name="test" status={ITEM_STATUS.NORMAL} />
      <br />
      <AttachmentItem name="test" progress={-1} status={ITEM_STATUS.ERROR} />
      <br />
      <AttachmentItem
        name="test"
        progress={value}
        status={ITEM_STATUS.LOADING}
      />
      <br />
      <div>Long title example:</div>
      <AttachmentItem
        name="this is a really long title this is a really long title this is a really long title"
        status={ITEM_STATUS.NORMAL}
      />
      <br />
      <div>Property test</div>
      <AttachmentItem name={name} status={ITEM_STATUS.NORMAL} />
    </div>
  );
});

storiesOf('Pattern/MessageInput', module).add('AttachmentList', () => {
  const removeAttachment = () => {};
  const f2 = 'f2.txt';
  const f1 = 'f1.txt';
  const f3 =
    'This is the name of attachment itemThis is the name of attachment item.txt';
  const files = [{ name: f1, id: 1 }, { name: f2, id: 2 }, { name: f3, id: 3 }];
  const array = Array(18)
    .fill(files)
    .flat();
  return (
    <div>
      <AttachmentList
        files={array as ItemInfo[]}
        removeAttachment={removeAttachment}
      />
    </div>
  );
});

storiesOf('Pattern/MessageInput', module).add('DuplicateAlert', () => {
  const removeAttachment = () => {};
  const f2 = 'f2.txt';
  const f1 = 'f1.txt';
  const f3 =
    'This is the name of attachment itemThis is the name of attachment item.txtsdfsdfdsfsdfdsfsfsdfsdfsdfsdfsdf';
  const files = [{ name: f1 }, { name: f2 }, { name: f3 }];
  const array = Array(18)
    .fill(files)
    .flat();
  const callback = (title: string) => alert(`you clicked ${title}`);
  return (
    <div>
      <DuplicateAlert
        title="Update Files?"
        subtitle="The following files already exist."
        footText="Do you want to update the existing files or do you wish to create new files?"
        duplicateFiles={array}
        onCancel={() => callback('cancel')}
        onCreate={() => callback('create')}
        onUpdate={() => callback('update')}
      />
    </div>
  );
});
