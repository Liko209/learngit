/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-26 19:35:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import { fade } from '@material-ui/core/styles/colorManipulator';

import styled from '../../foundation/styled-components';
import { JuiOutlineTextField } from '../../components/Forms/OutlineTextField';
// import { JuiSearchBar } from '../SearchBar';
import {
  width,
  palette,
  opacity,
  typography,
  spacing,
} from '../../foundation/utils';
import { Theme } from '../../foundation/theme/theme';

const TobBarSearch = styled(JuiOutlineTextField)`
  width: 100%;
  margin-right: ${spacing(3)};
  max-width: ${width(67)};
  background-color: ${({ theme }: { theme: Theme }) =>
    fade(palette('common', 'white')({ theme }), opacity('p20')({ theme }))};
  border: 0;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }: { theme: Theme }) =>
      fade(palette('common', 'white')({ theme }), opacity('p30')({ theme }))};
  }
  .topBar-input-root {
    pointer-events: none;
  }
  input {
    cursor: pointer;
    color: ${palette('common', 'white')};
    ${typography('body1')};
  }
  span.search,
  span.close {
    color: ${palette('common', 'white')};
  }
`;

type StyledJuiSearchBarProps = {
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
        classes: {
          root: 'topBar-input-root',
        },
        inputProps: {
          maxLength: 200,
          'data-test-automation-id': 'topBar-search-input',
        },
      }}
      data-test-automation-id="topBar-search-bar"
      className="topBar-search-bar"
    />
  );
});

export { StyledJuiSearchBar };
