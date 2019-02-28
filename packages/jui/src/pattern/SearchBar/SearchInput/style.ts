/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 13:56:11
 * Copyright © RingCentral. All rights reserved.
 */
import MuiTextField from '@material-ui/core/TextField';
import { JuiIconButton } from '../../../components/Buttons/IconButton';
import styled, { css } from '../../../foundation/styled-components';
import {
  spacing,
  height,
  grey,
  typography,
  palette,
} from '../../../foundation/utils/styles';
import { JuiTextField } from '../../../components/Forms';

type SearchWrapperType = {
  focus: boolean;
  hasValue?: boolean;
};

const SearchWrapper = styled<SearchWrapperType, 'div'>('div')`
  height: ${height(10)};
  padding: ${spacing(0, 4)};
  align-items: center;
  display: flex;
  position: relative;
  box-sizing: border-box;
  background: ${({ focus }) =>
    focus ? palette('common', 'white') : grey('100')};
  ${({ hasValue, focus }) => {
    return hasValue && focus
      ? css`
          border-top-right-radius: ${spacing(1)};
          border-top-left-radius: ${spacing(1)};
        `
      : css`
          border-radius: ${spacing(1)};
        `;
  }};
  ${({ focus }) =>
    focus
      ? css`
          border-bottom: 1px solid ${grey('200')};
        `
      : null};
  z-index: ${({ theme }) => theme.zIndex.drawer + 12};
  &:hover {
    background: ${({ focus }) =>
      focus ? palette('common', 'white') : grey('300')};
  }
`;

const SearchIcon = styled(JuiIconButton)`
  color: ${grey('500')};
`;

const CloseBtn = styled(SearchIcon)`
  cursor: pointer;
`;

const SearchInput = styled(JuiTextField)`
  && {
    width: 100%;
    margin: 0 ${spacing(2)};
    ${typography('body1')};
    color: ${grey('500')};
    .search-input {
      ::-webkit-input-placeholder {
        color: ${grey('500')};
      }

      ::-moz-placeholder {
        color: ${grey('500')};
      }

      ::-ms-placeholder {
        color: ${grey('500')};
      }

      ::placeholder {
        color: ${grey('500')};
      }
    }
  }
` as typeof MuiTextField;

export { SearchWrapper, CloseBtn, SearchInput, SearchIcon };
