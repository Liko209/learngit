/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-11 17:32:34
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../styled-components';
import MuiSwitch from '@material-ui/core/Switch';
import { width, spacing, height, palette } from '../../utils/styles';

const SwitchButton = styled(MuiSwitch)`
  &:hover {
    .custom-bar {
      opacity: ${({ theme }) =>
        1 - theme.palette.action.hoverOpacity} !important;
    }
  }
  &:active {
    .custom-bar {
      opacity: ${({ theme }) =>
        1 - theme.palette.action.hoverOpacity * 2} !important;
    }
  }

  .custom-bar {
    opacity: 1;
    background: ${palette('accent', 'ash')};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 2.5}px;
    padding: ${({ theme }) => spacing(1)({ theme })};
    width: ${({ theme }) => width(9)({ theme })};
    height: ${({ theme }) => height(5)({ theme })};
    box-sizing: border-box;
  }

  .custom-icon {
    width: ${({ theme }) => width(3)({ theme })};
    height: ${({ theme }) => height(3)({ theme })};
    margin: ${({ theme }) => spacing(1)({ theme })} 0 0;
    box-shadow: none;
  }

  .custom-checked {
    .custom-icon {
      background: #fff;
    }
    & + .custom-bar {
      opacity: 1;
    }
  }
`;

export { SwitchButton };
