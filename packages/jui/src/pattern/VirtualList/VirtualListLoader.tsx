/*
 * @Author: isaac.liu
 * @Date: 2019-01-17 09:34:44
 * Copyright © RingCentral. All rights reserved.
 */
import { Component, ReactNode } from 'react';
import { IVirtualListDataSource } from './VirtualListDataSource';

type Props = {
  content: () => ReactNode;
  pageSize?: number;
  dataSource: IVirtualListDataSource;
};

type State = {
  firstLoad: boolean;
  loading: boolean;
  loadedCount: number;
};

class JuiVirtualListLoader extends Component<Props, State> {
  static PAGE_SIZE = 20;
  constructor(props: Props) {
    super(props);
    this.state = {
      firstLoad: false,
      loading: false,
      loadedCount: 0,
    };
  }
  async componentDidMount() {
    const {
      dataSource,
      pageSize = JuiVirtualListLoader.PAGE_SIZE,
    } = this.props;
    const { loadMore } = dataSource;
    if (loadMore) {
      const { loadedCount } = this.state;
      this.setState({ loading: true });
      const result = await loadMore(0, pageSize);
      this.setState({
        firstLoad: true,
        loading: false,
        loadedCount: loadedCount + result.length,
      });
    }
  }

  render() {
    const { content, dataSource } = this.props;
    const { renderEmptyContent, firstLoader, moreLoader } = dataSource;
    const { firstLoad, loading, loadedCount } = this.state;
    if (firstLoad) {
      if (loading) {
        // loading more
        return moreLoader && moreLoader();
      }
      if (loadedCount === 0) {
        return renderEmptyContent && renderEmptyContent();
      }
      return content();
    }
    return firstLoader && firstLoader();
  }
}

export { JuiVirtualListLoader };
