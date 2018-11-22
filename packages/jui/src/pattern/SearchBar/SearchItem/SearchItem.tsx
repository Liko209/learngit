/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:06:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
// import {
//   grey,
//   spacing,
//   height,
//   typography,
// } from '../../../foundation/utils/styles';

const SearchItemWrapper = styled.div``;

const SearchItemAvatar = styled.div``;

type JuiSearchItemProps = {
  avatar: JSX.Element;
};

const JuiSearchItem = (props: JuiSearchItemProps) => {
  const { avatar } = props;
  return (
    <SearchItemWrapper>
      <SearchItemAvatar>{avatar}</SearchItemAvatar>
    </SearchItemWrapper>
  );
};

export { JuiSearchItem, JuiSearchItemProps };
