/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 17:32:34
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../foundation/styled-components';
import MuiSwitch from '@material-ui/core/Switch';
import {
  width,
  spacing,
  height,
  palette,
} from '../../../foundation/utils/styles';

const ToggleButton = styled(MuiSwitch)`
  && {
    width: ${spacing(9)};
  }
  .custom-switchBase {
    width: ${spacing(9)};
    height: ${spacing(5)};
    transform: translateX(${spacing(-2)});
  }
  ${props =>
    !props.disabled
      ? `
    &:hover {
      .custom-bar {
        opacity: ${1 - props.theme.palette.action.hoverOpacity} !important;
      }
    }
    &:active {
      .custom-bar {
        opacity: ${1 - props.theme.palette.action.hoverOpacity * 2} !important;
      }
    }
  `
      : null};

  .custom-bar {
    opacity: 1;
    background: ${palette('accent', 'ash')};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 2.5}px;
    padding: ${spacing(1)};
    width: ${spacing(9)};
    height: ${spacing(4.5)};
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    margin: 0;
  }

  && .custom-icon {
    width: ${width(3)};
    height: ${height(3)};
    box-shadow: none;
  }

  .custom-disabled {
    .custom-icon {
      background: #fff;
    }
  }

  .custom-checked {
    transform: translateX(${spacing(2)});
    .custom-icon {
      background: #fff;
    }
    & + .custom-bar {
      opacity: 1;
    }
  }

  .custom-disabled.custom-checked {
    & + .custom-bar {
      opacity: 1;
      background: ${palette('primary', '100')};
    }
  }

  input {
    transform: ${({ checked, theme }) =>
      `translateX(${spacing(checked ? -2 : 2)({ theme })})`};
  }
`;

export { ToggleButton };
