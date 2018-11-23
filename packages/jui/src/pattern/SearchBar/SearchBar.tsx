/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:19:49
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiSearchInput } from './';

const JuiSearchWrapper = styled.div``;

type JuiSearchBarProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

class JuiSearchBar extends React.Component<JuiSearchBarProps, {}> {
  constructor(props: JuiSearchBarProps) {
    super(props);
  }

  render() {
    const { onChange } = this.props;

    return (
      <JuiSearchWrapper>
        <JuiSearchInput onChange={onChange} />
      </JuiSearchWrapper>
    );
  }
}

export { JuiSearchBar };
