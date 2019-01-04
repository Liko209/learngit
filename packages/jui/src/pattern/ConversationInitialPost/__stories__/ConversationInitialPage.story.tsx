/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:26:04
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { text } from '@storybook/addon-knobs';
// import backgrounds from '@storybook/addon-backgrounds';
// import { withInfoDecorator } from '../../../foundation/utils/decorators';

import {
  JuiConversationInitialPost,
  JuiConversationInitialPostHeader,
} from '..';
import { JuiEmptyScreen } from '../../EmptyScreen';
import { JuiButton } from '../../../components/Buttons';
import { JuiLink } from '../../../components/Link';
import image from './img/illustrator_2x.png';

const name = <JuiLink>John Smith</JuiLink>;

const ConversationInitialPostHeader = () => {
  return (
    <JuiConversationInitialPostHeader
      name={name}
      teamName="Global UXD"
      description="This Team about: Mauris non tempor quam, et lacinia sapien. Mauris accumsan eros eget libero posuere vulputate."
    />
  );
};

const Action1 = (
  <JuiButton variant="outlined" color="primary">
    Share a file
  </JuiButton>
);
const Action2 = (
  <JuiButton variant="outlined" color="primary">
    Create a task
  </JuiButton>
);
const Action3 = (
  <JuiButton variant="outlined" color="primary">
    Integrate apps
  </JuiButton>
);

const ConversationInitialPostBody = () => {
  return (
    <JuiEmptyScreen
      text="Get Started"
      content="Having a home based business is a wonderful asset to your life."
      actions={[Action1, Action2, Action3]}
      image={{ url: image, width: 67, height: 53 }}
    />
  );
};

storiesOf('Pattern', module).add('ConversationInitialPost', () => {
  return (
    <JuiConversationInitialPost>
      <ConversationInitialPostHeader />
      <ConversationInitialPostBody />
    </JuiConversationInitialPost>
  );
});
