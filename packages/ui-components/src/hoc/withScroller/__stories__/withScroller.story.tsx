/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-22 15:22:47
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../../.storybook/storybook.d.ts" />
import _ from 'lodash';
import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { withScroller } from '../withScroller';
import styled from '../../../styled-components';

const DemoWrapper = styled.div`
  width: 100%;
  height: 100px;
  border: 1px solid #d1d1d1;
  margin-bottom: 24px;
`;

storiesOf('HoC/withScroller', module)
  .addWithJSX('demo', () => {
    const Demo = ({ children }: any) => <ul>{children}</ul>;

    const DemoWithScroller = withScroller(Demo);

    return (
      <DemoWrapper>
        <DemoWithScroller
          initialScrollTop={999999}
          onScrollToTop={action('onScrollToTop')}
          onScrollToBottom={action('onScrollToBottom')}
        >
          {_.range(100).map(n => (
            <li key={n}>{n}</li>
          ))}
        </DemoWithScroller>
      </DemoWrapper>
    );
  })
  .addWithJSX('stick to bottom', () => {
    class DemoContent extends Component<any, any> {
      render() {
        const { children } = this.props;
        return <ul>{children}</ul>;
      }
    }

    const DemoContentWithScroller = withScroller(DemoContent);

    class Demo extends Component<any, any> {
      constructor(props: any) {
        super(props);
        this.state = { items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
        setInterval(() => this._addItem(), 1000);
      }

      render() {
        const { items } = this.state;
        return (
          <DemoWrapper>
            <DemoContentWithScroller initialScrollTop={99999} stickTo="bottom">
              {items.map(n => (
                <li key={n}>{n}</li>
              ))}
            </DemoContentWithScroller>
          </DemoWrapper>
        );
      }

      private _addItem = () => {
        const { items } = this.state;
        const newItem = items.length;
        this.setState({
          items: [...items, newItem],
        });
      }
    }

    return <Demo />;
  });
