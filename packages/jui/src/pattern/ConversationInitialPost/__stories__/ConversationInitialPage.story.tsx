/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:26:04
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {
  JuiConversationInitialPostWrapper,
  JuiConversationInitialPostHeader,
  StyledTitle,
  StyledSpan,
  StyledTeamName,
} from '..';
import { JuiConversationPageInit } from '../../EmptyScreen';
import { JuiButton } from '../../../components/Buttons';
import image from './img/illustrator_2x.png';

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
    <JuiConversationPageInit
      text="Get Started"
      actions={[Action1, Action2, Action3]}
      image={image}
    />
  );
};

storiesOf('Pattern', module).add('ConversationInitialPost', () => {
  return (
    <JuiConversationInitialPostWrapper>
      <JuiConversationInitialPostHeader>
        <StyledTitle>
          {'Dan Abramov'}
          <StyledSpan>&nbsp;create a team&nbsp;</StyledSpan>
          <StyledTeamName>RingCentral</StyledTeamName>
          <StyledSpan>&nbsp;on 2017/1/1</StyledSpan>
        </StyledTitle>
      </JuiConversationInitialPostHeader>
      <ConversationInitialPostBody />
    </JuiConversationInitialPostWrapper>
  );
});
