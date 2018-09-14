/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:47
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import _ from 'lodash';
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { withInfiniteScroll } from '../withInfiniteScroll';
import styled from '../../../styled-components';

const DemoWrapper = styled.div`
  width: 100%;
  height: 140px;
  border: 1px solid #d1d1d1;
  margin-bottom: 24px;
`;

storiesOf('HoC/withInfiniteScroll', module).addWithJSX('demo', () => {
  const Demo = ({ children }: any) => <ul>{children}</ul>;

  const DemoWithInfiniteScroll = withInfiniteScroll(Demo);

  return (
    <DemoWrapper>
      <DemoWithInfiniteScroll
        onScrollToTop={action('onScrollToTop')}
        onScrollToBottom={action('onScrollToBottom')}
      >
        {_.range(100).map(n => (
          <li key={n}>{n}</li>
        ))}
      </DemoWithInfiniteScroll>
    </DemoWrapper>
  );
});
