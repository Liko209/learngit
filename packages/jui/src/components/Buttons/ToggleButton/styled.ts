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
    width: ${({ theme }) => spacing(9)};
  }
  .custom-switchBase {
    width: ${({ theme }) => spacing(9)};
    height: ${({ theme }) => spacing(5)};
    transform: translateX(${({ theme }) => spacing(-2)});
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
    padding: ${({ theme }) => spacing(1)({ theme })};
    width: ${({ theme }) => width(9)({ theme })};
    height: ${({ theme }) => height(5)({ theme })};
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    margin: 0;
  }

  .custom-icon {
    width: ${({ theme }) => width(3)({ theme })};
    height: ${({ theme }) => height(3)({ theme })};
    box-shadow: none;
  }

  .custom-disabled {
    .custom-icon {
      background: #fff;
    }
  }

  .custom-checked {
    transform: translateX(${({ theme }) => spacing(2)});
    .custom-icon {
      background: #fff;
    }
    & + .custom-bar {
      opacity: 1;
    }
  }
`;

export { ToggleButton };
