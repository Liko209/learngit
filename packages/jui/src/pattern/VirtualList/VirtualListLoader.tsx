/*
 * @Author: isaac.liu
 * @Date: 2019-01-17 09:34:44
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { IVirtualListDataSource } from './VirtualListDataSource';
import { JuiVirtualList, JuiVirtualListProps } from './VirtualList';

type Props = {
  pageSize?: number;
  dataSource: IVirtualListDataSource;
};

type State = {
  firstLoad: boolean;
  loading: boolean;
};

class JuiVirtualListLoader extends Component<Props, State> {
  static PAGE_SIZE = 20;
  constructor(props: Props) {
    super(props);
    this.state = {
      firstLoad: false,
      loading: false,
    };
  }
  async componentDidMount() {
    const {
      dataSource,
      pageSize = JuiVirtualListLoader.PAGE_SIZE,
    } = this.props;
    const { loadMore } = dataSource;
    if (loadMore) {
      this.setState({ loading: true });
      await loadMore(0, pageSize);
      this.setState({
        firstLoad: true,
        loading: false,
      });
    }
  }

  render() {
    const { dataSource } = this.props;
    const { renderEmptyContent, firstLoader, isEmptyList } = dataSource;
    const { firstLoad, loading } = this.state;
    if (firstLoad) {
      if (!loading && isEmptyList()) {
        return renderEmptyContent && renderEmptyContent();
      }
      const props: JuiVirtualListProps = {
        dataSource,
      };
      return <JuiVirtualList {...props} />;
    }
    return firstLoader && firstLoader();
  }
}

export { JuiVirtualListLoader };
