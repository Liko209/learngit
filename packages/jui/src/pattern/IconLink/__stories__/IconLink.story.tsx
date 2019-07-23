/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-07-22 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { storiesOf, StoryDecorator } from '@storybook/react';
import { JuiIconLink } from '../IconLink';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 500px;
`;

const Decorator: StoryDecorator = storyFn => <Wrapper>{storyFn()}</Wrapper>;

storiesOf('Pattern', module)
  .addDecorator(Decorator)
  .add('IconLink', () => (
    <JuiIconLink iconName="event_new">{'hello  '.repeat(10)}</JuiIconLink>
  ));
