/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-04 14:47:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import styled from '../../../foundation/styled-components';

import { JuiConversationInitialPostBody } from '../../ConversationInitialPost';
import { JuiButton } from '../../../components/Buttons';
import { JuiLink } from '../../../components/Link';
import image from './illustrator_2x.png';

const name = <JuiLink>John Smith</JuiLink>;

const Div = styled.div`
  width: 288px;
  margin: 0 auto;
`;

const Action1 = (
  <JuiButton variant="outlined" color="primary">
    Share a file
  </JuiButton>
);

const ConversationInitialPostBody = () => {
  const t = text('text', 'No files shared yet');
  const content = text(
    'content',
    'Files that get shared in your conversation automatically show up here.',
  );
  return (
    <JuiConversationInitialPostBody
      align="flex-start"
      text={t}
      content={content}
      actions={[Action1]}
      image={{ url: image, width: 47, height: 37 }}
    />
  );
};

storiesOf('Pattern/ConversationRightShelf', module).add('EmptyScreen', () => {
  return (
    <Div>
      <ConversationInitialPostBody />
    </Div>
  );
});
