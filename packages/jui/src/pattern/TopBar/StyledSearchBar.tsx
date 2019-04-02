/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 19:35:53
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiOutlineTextField } from '../../components/Forms/TextField';
// import { JuiSearchBar } from '../SearchBar';
import { width } from '../../foundation/utils';

const TobBarSearch = styled(JuiOutlineTextField)`
  width: ${width(67)};
  cursor: pointer;
  input {
    cursor: pointer;
  }
`;

type StyledJuiSearchBarProps = {
  // isShowSearchBar: boolean;
  // closeSearchBar: Function;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledJuiSearchBar = (props: StyledJuiSearchBarProps) => {
  const { onClick } = props;
  return (
    <TobBarSearch
      iconName="search"
      radiusType="circle"
      iconPosition="left"
      disabled={true}
      onClick={onClick}
    />
  );
};

export { StyledJuiSearchBar };
