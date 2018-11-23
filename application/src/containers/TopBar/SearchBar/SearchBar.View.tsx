/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiSearchBar } from 'jui/pattern/SearchBar';
import { ViewProps } from './types';

class SearchBarView extends React.Component<ViewProps, {}> {
  onChange = (e: any) => async (value: string) => {
    const { search } = this.props;
    console.log(e, '---result e');
    await search(value);
  }

  render() {
    return <JuiSearchBar onChange={this.onChange} />;
  }
}

export { SearchBarView };
