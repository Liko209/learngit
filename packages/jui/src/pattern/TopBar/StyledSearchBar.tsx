/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 19:35:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import { fade } from '@material-ui/core/styles/colorManipulator';

import styled from '../../foundation/styled-components';
import { JuiOutlineTextField } from '../../components/Forms/TextField';
// import { JuiSearchBar } from '../SearchBar';
import { width, palette, opacity } from '../../foundation/utils';
import { Theme } from '../../foundation/theme/theme';

const TobBarSearch = styled(JuiOutlineTextField)`
  width: ${width(67)};
  background-color: ${({ theme }: { theme: Theme }) =>
    fade(palette('common', 'white')({ theme }), opacity('p20')({ theme }))};
  border: 1px solid
    ${({ theme }: { theme: Theme }) =>
      fade(palette('common', 'white')({ theme }), opacity('p20')({ theme }))};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }: { theme: Theme }) =>
      fade(palette('common', 'white')({ theme }), opacity('p10')({ theme }))};
    border: 1px solid
      ${({ theme }: { theme: Theme }) =>
        fade(palette('common', 'white')({ theme }), opacity('p10')({ theme }))};
  }
  input {
    cursor: pointer;
    color: ${palette('common', 'white')};
  }
  span.search,
  span.close {
    color: ${palette('common', 'white')};
  }
`;

type StyledJuiSearchBarProps = {
  // isShowSearchBar: boolean;
  // closeSearchBar: Function;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  onClear: () => void;
  value: string;
  placeholder: string;
};

const StyledJuiSearchBar = memo((props: StyledJuiSearchBarProps) => {
  const { onClick, value, onClear, placeholder } = props;
  const position = value === '' ? 'left' : 'both';
  const iconName = value === '' ? 'search' : ['search', 'close'];

  return (
    <TobBarSearch
      iconName={iconName}
      radiusType="circle"
      iconPosition={position}
      disabled={true}
      onClick={onClick}
      value={value}
      onClickIconRight={onClear}
      InputProps={{
        placeholder,
        inputProps: {
          maxLength: 200,
        },
      }}
    />
  );
});

export { StyledJuiSearchBar };
