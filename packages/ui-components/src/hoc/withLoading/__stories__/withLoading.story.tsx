/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:10:56
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment, PureComponent } from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs/react';
import styled from '../../../styled-components';
import { withLoading } from '../withLoading';
import { withLoadingMore } from '../withLoadingMore';

const DemoWrapper = styled.div`
  width: 100%;
  height: 140px;
  overflow: auto;
  border: 1px solid #d1d1d1;
  margin-bottom: 24px;
`;

const StyledList = styled.ul`
  margin: 0;
  padding: 0;
  background: #f1f1f1;
  min-height: 100%;
  list-style: none;
`;

const StyledListItem = styled.li`
  padding: 8px 16px;

  &:hover {
    opacity: 0.36;
    background: #ffffff;
  }
`;

const StyledCustomizedLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
`;

type Item = {
  id: number;
};

type ListProps = {
  children: JSX.Element;
};

storiesOf('HoC/withLoading', module).addWithJSX('demo', () => {
  const knobLoading = boolean('force loading', false);

  const List = (props: ListProps) => {
    return <StyledList>{props.children}</StyledList>;
  };

  const CustomizedLoading = () => (
    <StyledCustomizedLoading>🚄 Loading...</StyledCustomizedLoading>
  );

  // Step 1, wrap your component with default loading
  const ListWithLoading = withLoading(List);
  // Or with a customized loading component
  const ListWithCustomizedLoading = withLoading(List, CustomizedLoading);
  // Or with loading more
  const ListWithLoadingMore = withLoadingMore(List);

  class Demo extends PureComponent<any, any> {
    constructor(props: any) {
      super(props);
      this.state = {
        loading: false,
        items: [],
      };
    }

    render() {
      const { loading, items } = this.state;

      const _loading = knobLoading || loading;

      const children = items.map((item: Item) => {
        return <StyledListItem key={item.id}>Item {item.id}</StyledListItem>;
      });

      const originalItems = [
        { id: 10 },
        { id: 9 },
        { id: 8 },
        { id: 7 },
        { id: 6 },
        { id: 5 },
        { id: 4 },
        { id: 3 },
        { id: 2 },
        { id: 1 },
      ];
      const loadingMoreChildren = items
        .concat(originalItems)
        .map((item: Item) => {
          return <StyledListItem key={item.id}>Item {item.id}</StyledListItem>;
        });

      // Step 2, use the wrapped component
      return (
        <div>
          default:
          <DemoWrapper>
            <ListWithLoading loading={_loading}>{children}</ListWithLoading>
          </DemoWrapper>
          customized:
          <DemoWrapper>
            <ListWithCustomizedLoading loading={_loading}>
              {children}
            </ListWithCustomizedLoading>
          </DemoWrapper>
          loading more:
          <DemoWrapper>
            <ListWithLoadingMore loadingTop={_loading} loadingBottom={false}>
              {loadingMoreChildren}
            </ListWithLoadingMore>
          </DemoWrapper>
        </div>
      );
    }

    async componentDidMount() {
      this.setState({ loading: true });
      const resp = await this._fetchData();
      this.setState({
        loading: false,
        items: resp.data,
      });
    }

    private async _fetchData(): Promise<any> {
      return new Promise((resolve: any) => {
        setTimeout(() => {
          resolve({
            data: [
              { id: 20 },
              { id: 19 },
              { id: 18 },
              { id: 17 },
              { id: 16 },
              { id: 15 },
              { id: 14 },
              { id: 13 },
              { id: 12 },
              { id: 11 },
            ],
          });
        },         3000);
      });
    }
  }

  return <Demo />;
});
