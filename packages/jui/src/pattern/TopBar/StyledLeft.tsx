/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 15:44:48
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { width } from '../../foundation/utils';
import { StyledSearchIconButton } from './StyledSearchIconButton';
import { JuiLogo } from './Logo';

type Props = {
  isShowSearchBar: boolean;
};

const StyledLeft = styled<Props, 'div'>('div')`
  display: flex;
  align-items: center;
  @media (min-width: 1280px) {
    flex: 1;
  }
  @media (min-width: 1100px) and (max-width: 1280px) {
    width: ${width(234)};
  }
  @media (max-width: 1100px) {
    flex: 1;
  }
  @media (max-width: 600px) {
    justify-content: space-between;
    .search-bar {
      display: ${({ isShowSearchBar }) => (isShowSearchBar ? 'block' : 'none')};
    }
    ${StyledSearchIconButton} {
      display: ${({ isShowSearchBar }) => (isShowSearchBar ? 'none' : 'block')};
    }
    ${JuiLogo} {
      display: ${({ isShowSearchBar }) => (isShowSearchBar ? 'none' : 'block')};
      width: ${width(24)};
    }
  }
  @media (min-width: 601px) {
    ${StyledSearchIconButton} {
      display: none;
    }
  }
`;

StyledLeft.displayName = 'StyledLeft';

export { StyledLeft };
