/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiOutlineTextFieldRef } from '../../../components/Forms/OutlineTextField';
import styled from '../../../foundation/styled-components';
import { grey, radius } from '../../../foundation/utils';
import { JuiSearchInput } from '../../SearchBar/SearchInput';

const StyledJuiOutlineTextField = styled(JuiSearchInput)`
  display: flex;
  justify-content: space-between;
  border-top: 0;
  border-right: 0;
  border-left: 0;
  border-top-left-radius: ${radius('xl')};
  border-top-right-radius: ${radius('xl')};
  border-color: ${grey('300')};
`;

const JuiGlobalSearchInput = StyledJuiOutlineTextField;

export { JuiGlobalSearchInput, JuiOutlineTextFieldRef };
