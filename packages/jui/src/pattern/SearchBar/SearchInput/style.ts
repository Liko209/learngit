/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 13:56:11
 * Copyright © RingCentral. All rights reserved.
 */
import MuiTextField from '@material-ui/core/TextField';
import { JuiIconButton } from '../../../components/Buttons';
import styled, { css } from '../../../foundation/styled-components';
import { Theme } from '../../../foundation/theme/theme';
import {
  spacing,
  height,
  grey,
  typography,
  palette,
} from '../../../foundation/utils/styles';
import { JuiTextField } from '../../../components/Forms';
import { fade } from '@material-ui/core/styles/colorManipulator';

type SearchWrapperType = {
  focus: boolean;
  hasValue?: boolean;
};

const colorTransition = ({ theme }: { theme: Theme }) =>
  theme.transitions.create(['color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  });

const SearchWrapper = styled<SearchWrapperType, 'div'>('div')`
  height: ${height(10)};
  padding: ${spacing(0, 4)};
  align-items: center;
  display: flex;
  position: relative;
  box-sizing: border-box;
  background: ${({ theme, focus }) =>
    focus
      ? palette('common', 'white')
      : fade(palette('common', 'white')({ theme }), 0.22)};

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

  transition: ${colorTransition};

  &:hover {
    background: ${({ focus, theme }) =>
      focus ? undefined : fade(palette('common', 'white')({ theme }), 0.32)};
  }
`;

const SearchIcon = styled(JuiIconButton)`
  transition: ${colorTransition};
`;

const CloseBtn = styled(JuiIconButton)`
  cursor: pointer;
  transition: ${colorTransition};
`;

const SearchInput = styled(JuiTextField)`
  && {
    width: 100%;
    margin: 0 ${spacing(2)};
    ${typography('body1')};
    transition: ${colorTransition};
    .search-input {
      color: ${palette('common', 'white')};
      ::placeholder {
        color: ${palette('common', 'white')};
      }
      &:focus {
        color: ${palette('grey', '500')};
        ::placeholder {
          color: ${palette('grey', '500')};
        }
      }
    }
  }
` as typeof MuiTextField;

export { SearchWrapper, CloseBtn, SearchInput, SearchIcon };
