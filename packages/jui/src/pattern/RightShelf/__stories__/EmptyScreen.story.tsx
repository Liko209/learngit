/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-04 14:47:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { JuiRightShelfEmptyScreen } from '../../EmptyScreen';
import { JuiButton } from '../../../components/Buttons';
import image from './Files.svg';

const Action1 = (
  <JuiButton variant="outlined" color="primary">
    Share a file
  </JuiButton>
);

storiesOf('Pattern/ConversationRightShelf', module).add('EmptyScreen', () => {
  const t = text('text', 'No files shared yet');
  const content = text(
    'content',
    'Files that get shared in your conversation automatically show up here.',
  );
  return (
    <JuiRightShelfEmptyScreen
      text={t}
      content={content}
      actions={[Action1]}
      image={image}
    />
  );
});
