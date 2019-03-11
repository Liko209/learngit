/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:39
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { PureComponent } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import styled from '../../../foundation/styled-components';
import { withScroller } from '../withScroller';

const DemoWrapper = styled.div`
  width: 100%;
  height: 100px;
  border: 1px solid #d1d1d1;
  margin-bottom: 24px;
`;

storiesOf('HoC/withScroller', module)
  .add('demo', () => {
    const Demo = ({ children }: any) => <ul>{children}</ul>;

    const DemoWithScroller = withScroller(Demo);

    return (
      <DemoWrapper>
        <DemoWithScroller
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
  .add('stick to bottom', () => {
    class DemoContent extends PureComponent<any, any> {
      render() {
        const { children } = this.props;
        return <ul>{children}</ul>;
      }
    }

    const DemoContentWithScroller = withScroller(DemoContent);

    class Demo extends PureComponent<any, any> {
      constructor(props: any) {
        super(props);
        this.state = { items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
        setInterval(() => this._addItem(), 1000);
      }

      render() {
        const { items } = this.state;
        return (
          <DemoWrapper>
            <DemoContentWithScroller stickTo="bottom">
              {items.map((n: any) => (
                <li key={n}>{n}</li>
              ))}
            </DemoContentWithScroller>
          </DemoWrapper>
        );
      }

      private _addItem = () => {
        const { items } = this.state;
        const newItemPrev = items[0] - 1;
        const newItem = items[items.length - 1] + 1;
        this.setState({
          items: [newItemPrev, ...items, newItem],
        });
      }
    }

    return <Demo />;
  });
