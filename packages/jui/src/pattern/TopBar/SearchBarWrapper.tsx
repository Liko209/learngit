/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 23:18:39
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { width, spacing } from '../../foundation/utils/styles';
// import { JuiSearchBar } from '../SearchBar';

const JuiSearchBarWrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: ${width(327)};
  margin: ${spacing(0, 5)};
`;

JuiSearchBarWrapper.displayName = 'JuiSearchBarWrapper';

export { JuiSearchBarWrapper };
