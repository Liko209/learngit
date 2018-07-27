/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-03 17:00:13
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';

import { observer } from 'mobx-react';

import HomeLoading from '@/components/HomeLoading';
import ErrorHandle from '@/containers/ErrorHandle';

import HomePresenter from './HomePresenter';

@observer
class HomeLoadingWrapper extends React.Component {
  private homePresenter: any;
  constructor(props: any) {
    super(props);
    this.homePresenter = new HomePresenter();
  }

  componentDidUpdate() {
    // TODO: error format is wrong
    const { error } = this.homePresenter;
    const errorHandle = new ErrorHandle(error);

    if (Object.keys(error).length) {
      errorHandle.show();
    }
  }

  componentWillUnmount() {
    this.homePresenter.dispose();
  }

  render() {
    const { loading } = this.homePresenter;

    return <div>{loading && <HomeLoading />}</div>;
  }
}

export default HomeLoadingWrapper;
