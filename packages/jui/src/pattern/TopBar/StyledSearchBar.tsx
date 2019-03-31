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

const TobBarSearch: any = styled(JuiOutlineTextField)`
  width: ${width(67)};
  cursor: pointer;
  input {
    cursor: pointer;
  }
`;

// type StyledJuiSearchBarProps = {
//   isShowSearchBar: boolean;
//   closeSearchBar: Function;
// };

const StyledJuiSearchBar = () => {
  return (
    <TobBarSearch
      iconName="search"
      radiusType="round"
      iconPosition="left"
      disabled={true}
    />
  );
};

export { StyledJuiSearchBar };
