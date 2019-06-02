/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-04 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
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

storiesOf('Components/Tabs', module).add('Tabs', () => {
  return (
    <Wrapper>
      <JuiTabs defaultActiveIndex={5} tag="right-shelf" moreText="More">
        <JuiTab title="0Pinned">
          <div>Pinned List</div>
        </JuiTab>
        <JuiTab title="1Files Files Files Files Files">
          <div>Files List</div>
        </JuiTab>
        <JuiTab title="2Images">
          <div>Images List</div>
        </JuiTab>
        <JuiTab title="3Tasks">
          <div>Tasks List</div>
        </JuiTab>
        <JuiTab title="4Notes">
          <div>Notes List</div>
        </JuiTab>
        <JuiTab title="5Events">
          <div>Events List</div>
        </JuiTab>
        <JuiTab title="6Integration">
          <div>Integration List</div>
        </JuiTab>
      </JuiTabs>
    </Wrapper>
  );
});
