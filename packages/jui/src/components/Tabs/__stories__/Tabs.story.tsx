/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-04 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiTabs, JuiTab } from '../index';
import styled from '../../../foundation/styled-components';
import { width, height, grey, palette } from '../../../foundation/utils';

const Wrapper = styled('div')`
  width: ${width(90)};
  height: ${height(70)};
  margin: 0 auto;
  background: ${palette('common', 'white')};
  border: 1px solid ${grey('300')};
`;

storiesOf('Components/Tabs', module)
  .addDecorator(withInfoDecorator(JuiTabs, { inline: true }))
  .add('Tabs', () => {
    return (
      <Wrapper>
        <JuiTabs defaultActiveIndex={5}>
          <JuiTab key={0} title="0Pinned">
            <div>Pinned List</div>
          </JuiTab>
          <JuiTab key={1} title="1Files Files Files Files Files">
            <div>Files List</div>
          </JuiTab>
          <JuiTab key={2} title="2Images">
            <div>Images List</div>
          </JuiTab>
          <JuiTab key={3} title="3Tasks">
            <div>Tasks List</div>
          </JuiTab>
          <JuiTab key={4} title="4Notes">
            <div>Notes List</div>
          </JuiTab>
          <JuiTab key={5} title="5Events">
            <div>Events List</div>
          </JuiTab>
          <JuiTab key={6} title="6Integration">
            <div>Integration List</div>
          </JuiTab>
        </JuiTabs>
      </Wrapper>
    );
  });
